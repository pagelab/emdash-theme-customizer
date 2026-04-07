import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import type {
	ThemeCustomizerOptions,
	CSSVarGroup,
	DarkOverrideGroup,
} from "./index";
import { defaultOptions } from "./vars";

// ─── Bootstrap helpers ───────────────────────────────────────────────
// The variable schema is imported directly from `vars.ts` so it is
// available in both the Vite/Node config context and the workerd
// runtime context (the `globalThis` bridge doesn't survive the
// Node → workerd boundary used by the Cloudflare adapter).

const SCHEMA_KEY = "__schema__";

/** Read the variable schema — prefer KV, fall back to the static import. */
async function getOptions(ctx: PluginContext): Promise<ThemeCustomizerOptions> {
	const cached = await ctx.kv.get<ThemeCustomizerOptions>(SCHEMA_KEY);
	if (cached) return cached;

	// Persist the static defaults to KV for future calls.
	await ctx.kv.set(SCHEMA_KEY, defaultOptions as unknown);
	return defaultOptions;
}

/** Persist the options schema to KV (called on plugin:install). */
async function seedOptions(ctx: PluginContext): Promise<void> {
	await ctx.kv.set(SCHEMA_KEY, defaultOptions as unknown);
	ctx.log.info("Theme Customizer schema seeded to KV");
}

// ─── CSS generation ──────────────────────────────────────────────────

type CSSVarMap = Record<string, string>;

/** Expand a bare font family name into a full CSS font stack. */
function fontStack(name: string): string {
	if (name === "system-ui") return "system-ui, -apple-system, sans-serif";
	if (name === "Merriweather") return '"Merriweather", Georgia, serif';
	return `"${name}", system-ui, sans-serif`;
}

/** Resolve the final CSS value for a variable, expanding fonts. */
function resolveCSSValue(key: string, value: string): string {
	return key.startsWith("font-") && !value.includes(",")
		? fontStack(value)
		: value;
}

/**
 * Builds a CSS string that overrides `:root` custom properties.
 * `overrides` contains only the values the admin has changed.
 * `schema` carries the full list so we can resolve dark-mode `mapKey`.
 */
function buildCSS(
	overrides: CSSVarMap,
	darkOverrides: CSSVarMap,
	darkGroups: DarkOverrideGroup[],
): string {
	const lines: string[] = [];

	// Light / default overrides
	const lightEntries = Object.entries(overrides).filter(([, v]) => v);
	if (lightEntries.length > 0) {
		lines.push(":root {");
		for (const [key, value] of lightEntries) {
			lines.push(`  --${key}: ${resolveCSSValue(key, value)} !important;`);
		}
		lines.push("}");
	}

	// Dark mode overrides — we need the `mapKey` to know which CSS var a
	// dark override actually targets (e.g. `dark-color-bg` → `color-bg`).
	const mapKeyLookup = new Map<string, string>();
	for (const dg of darkGroups) {
		for (const [key, def] of Object.entries(dg.vars)) {
			mapKeyLookup.set(key, def.mapKey);
		}
	}

	const darkEntries = Object.entries(darkOverrides).filter(([, v]) => v);
	if (darkEntries.length > 0) {
		// System-preference dark mode
		lines.push("@media (prefers-color-scheme: dark) {");
		lines.push("  :root:not(.light) {");
		for (const [key, value] of darkEntries) {
			const cssKey = mapKeyLookup.get(key) ?? key;
			lines.push(`    --${cssKey}: ${value} !important;`);
		}
		lines.push("  }");
		lines.push("}");

		// Explicit `.dark` class
		lines.push(":root.dark {");
		for (const [key, value] of darkEntries) {
			const cssKey = mapKeyLookup.get(key) ?? key;
			lines.push(`  --${cssKey}: ${value} !important;`);
		}
		lines.push("}");
	}

	return lines.join("\n");
}

// ─── KV helpers ──────────────────────────────────────────────────────

const KV_PREFIX = "css:";

async function loadOverrides(
	kv: PluginContext["kv"],
	darkGroups: DarkOverrideGroup[],
): Promise<{ vars: CSSVarMap; darkVars: CSSVarMap }> {
	const darkKeys = new Set<string>();
	for (const dg of darkGroups) {
		for (const key of Object.keys(dg.vars)) darkKeys.add(key);
	}

	const vars: CSSVarMap = {};
	const darkVars: CSSVarMap = {};

	const allEntries = await kv.list(KV_PREFIX);
	for (const entry of allEntries) {
		const key = entry.key.slice(KV_PREFIX.length);
		const value = entry.value as string;
		if (darkKeys.has(key)) {
			darkVars[key] = value;
		} else {
			vars[key] = value;
		}
	}

	return { vars, darkVars };
}

// ─── Block Kit form builder ─────────────────────────────────────────

/** Build a flat array of form fields from a variable group. */
function buildFormFields(
	group: CSSVarGroup | DarkOverrideGroup,
	currentValues: CSSVarMap,
) {
	const fields: unknown[] = [];
	for (const [key, def] of Object.entries(group.vars)) {
		if (def.type === "select" && def.options) {
			fields.push({
				type: "select" as const,
				action_id: key,
				label: def.label,
				options: def.options,
				initial_value: currentValues[key] || def.default,
			});
		} else {
			fields.push({
				type: "text_input" as const,
				action_id: key,
				label: def.label,
				placeholder: def.default,
				initial_value: currentValues[key] ?? "",
			});
		}
	}
	return fields;
}

// ─── Plugin definition ──────────────────────────────────────────────

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				await seedOptions(ctx);
			},
		},

		/**
		 * On every page render, inject a `<style>` into `<head>` that overrides
		 * the theme defaults with any admin-customised values.
		 */
		"page:fragments": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				const opts = await getOptions(ctx);
				const { vars, darkVars } = await loadOverrides(
					ctx.kv,
					opts.darkGroups ?? [],
				);

				const css = buildCSS(vars, darkVars, opts.darkGroups ?? []);
				if (!css) return null;

				return [
					{
						kind: "html" as const,
						placement: "head" as const,
						html: `<style data-theme-customizer>${css}</style>`,
						key: "theme-customizer-css",
					},
				];
			},
		},
	},

	routes: {
		/** Return all current overrides (for external consumers / CLI) */
		settings: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const allEntries = await ctx.kv.list(KV_PREFIX);
				const result: CSSVarMap = {};
				for (const entry of allEntries) {
					result[entry.key.slice(KV_PREFIX.length)] = entry.value as string;
				}
				return result;
			},
		},

		/** Bulk-save overrides. Empty strings delete the key (revert to default). */
		"settings/save": {
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const input = routeCtx.input as Record<string, string>;
				for (const [key, value] of Object.entries(input)) {
					const trimmed = (value ?? "").trim();
					if (trimmed) {
						await ctx.kv.set(`${KV_PREFIX}${key}`, trimmed);
					} else {
						await ctx.kv.delete(`${KV_PREFIX}${key}`);
					}
				}
				return { success: true };
			},
		},

		/** Remove every override — revert the whole theme to defaults. */
		"settings/reset": {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const allEntries = await ctx.kv.list(KV_PREFIX);
				for (const entry of allEntries) {
					await ctx.kv.delete(entry.key);
				}
				return { success: true };
			},
		},

		/** Block Kit admin handler — renders the settings page with tabs. */
		admin: {
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const interaction = routeCtx.input as {
					type: string;
					page?: string;
					action_id?: string;
					values?: Record<string, string>;
					block_id?: string;
					value?: unknown;
				};

				const opts = await getOptions(ctx);

				/** Derive a URL slug from a group label. */
				function groupSlug(label: string): string {
					return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
				}

				/** Build the tab bar using actions with styled buttons. */
				function buildTabBar(activeSlug: string): unknown {
					const tabs = opts.groups.map((g) => {
						const slug = groupSlug(g.label);
						return {
							type: "button" as const,
							action_id: `tab_${slug}`,
							label: g.label,
							style: slug === activeSlug ? ("primary" as const) : ("secondary" as const),
							value: slug,
						};
					});

					// Reset button at the far right of the tab bar
					tabs.push({
						type: "button" as const,
						action_id: "reset_all",
						label: "Reset All to Defaults",
						style: "danger" as const,
						value: "reset",
						confirm: {
							title: "Reset Theme?",
							text: "This will remove all customisations and revert to the theme defaults.",
							confirm: "Reset",
							deny: "Cancel",
						},
					} as any);

					return { type: "actions" as const, elements: tabs };
				}

				/** Build blocks for the currently active tab. */
				async function renderSettingsPage(
					activeTab?: string,
					nonce?: number,
				): Promise<unknown[]> {
					const { vars, darkVars } = await loadOverrides(
						ctx.kv,
						opts.darkGroups ?? [],
					);
					const allVals = { ...vars, ...darkVars };
					const suffix = nonce ? `-${nonce}` : "";

					// Default to first group
					const firstSlug = groupSlug(opts.groups[0].label);
					const activeSlug = activeTab || firstSlug;

					// Determine which light group slug maps to "colors"
					const colorsSlug = opts.groups.find(
						(g) => g.label.toLowerCase() === "colors",
					)
						? groupSlug("Colors")
						: null;

					const blocks: unknown[] = [];

					// Tab bar
					blocks.push(buildTabBar(activeSlug));

					// Find the active group
					const activeGroup = opts.groups.find(
						(g) => groupSlug(g.label) === activeSlug,
					);

					if (!activeGroup) {
						blocks.push({
							type: "context",
							text: "Unknown section.",
						});
						return blocks;
					}

					const slug = groupSlug(activeGroup.label);
					const isColor = slug === colorsSlug;

					blocks.push({
						type: "context",
						text: isColor
							? "Customise your site's colour palette. Leave a field empty to keep the theme default."
							: "Customise your site's design tokens. Leave a field empty to keep the theme default.",
					});

					// Single-column form with one Save button
					blocks.push({
						type: "form",
						block_id: `group-${slug}${suffix}`,
						fields: buildFormFields(activeGroup, allVals),
						submit: { label: "Save", action_id: `save_${slug}` },
					});

					if (isColor) {
						// Dark mode overrides shown below
						for (const dg of opts.darkGroups ?? []) {
							const dSlug = groupSlug(dg.label);
							blocks.push({ type: "divider" });
							blocks.push({ type: "header", text: dg.label });
							blocks.push({
								type: "context",
								text: "Override colours for dark mode. Leave empty to use light-mode values.",
							});
							blocks.push({
								type: "form",
								block_id: `group-${dSlug}${suffix}`,
								fields: buildFormFields(dg, allVals),
								submit: { label: "Save", action_id: `save_${dSlug}` },
							});
						}
					}

					return blocks;
				}

				/** Extract active tab from a tab button action_id. */
				function tabFromAction(actionId?: string): string | undefined {
					if (actionId?.startsWith("tab_")) {
						return actionId.slice(4);
					}
					return undefined;
				}

				// ── Page load ──
				if (interaction.type === "page_load") {
					return {
						blocks: await renderSettingsPage(),
					};
				}

				// ── Tab switch ──
				if (interaction.type === "block_action") {
					const tab = tabFromAction(interaction.action_id);  
					if (tab) {
						return {
							blocks: await renderSettingsPage(tab),
						};
					}
				}

				// ── Form submit (any section) ──
				if (interaction.type === "form_submit") {
					const values = interaction.values ?? {};
					for (const [key, rawVal] of Object.entries(values)) {
						const value = String(rawVal ?? "").trim();
						if (value) {
							await ctx.kv.set(`${KV_PREFIX}${key}`, value);
						} else {
							await ctx.kv.delete(`${KV_PREFIX}${key}`);
						}
					}

					// Determine which tab the form belongs to so we stay on it
					const blockId = interaction.block_id ?? "";
					const match = blockId.match(/^group-([a-z0-9-]+?)(?:-\d+)?$/);
					const activeTab = match?.[1] ?? undefined;

					return {
						blocks: await renderSettingsPage(
							activeTab,
							Date.now(),
						),
						toast: { message: "Theme settings saved!", type: "success" },
					};
				}

				// ── Reset all ──
				if (
					interaction.type === "block_action" &&
					interaction.action_id === "reset_all"
				) {
					const allEntries = await ctx.kv.list(KV_PREFIX);
					for (const entry of allEntries) {
						await ctx.kv.delete(entry.key);
					}
					return {
						blocks: await renderSettingsPage(
							undefined,
							Date.now(),
						),
						toast: { message: "Theme reset to defaults", type: "success" },
					};
				}

				return {
					blocks: await renderSettingsPage(),
				};
			},
		},
	},
});
