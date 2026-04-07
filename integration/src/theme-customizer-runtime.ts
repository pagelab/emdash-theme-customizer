// @ts-ignore EmDash runtime is provided by the host project that consumes this starter.
import { getDb } from "emdash/runtime";

export interface ThemeCustomizerRuntimeOptions {
	pluginId?: string;
	schemaKey?: string;
	cssKeyPrefix?: string;
	addImportant?: boolean;
}

/**
 * Reads Theme Customizer overrides from the EmDash options table
 * and builds a CSS string ready to inject in the page head.
 */
export async function buildThemeCustomizerCSS(
	options: ThemeCustomizerRuntimeOptions = {},
): Promise<string> {
	const pluginId = options.pluginId ?? "theme-customizer";
	const schemaKey = options.schemaKey ?? "__schema__";
	const cssKeyPrefix = options.cssKeyPrefix ?? "css:";
	const addImportant = options.addImportant ?? true;

	const pluginPrefix = `plugin:${pluginId}:`;
	const dbCssPrefix = `${pluginPrefix}${cssKeyPrefix}`;

	const db = await getDb();
	const rows = await db
		.selectFrom("options")
		.select(["name", "value"])
		.where("name", "like", `${dbCssPrefix}%`)
		.execute();

	if (rows.length === 0) return "";

	const schemaRow = await db
		.selectFrom("options")
		.select("value")
		.where("name", "=", `${pluginPrefix}${schemaKey}`)
		.executeTakeFirst();

	const darkKeys = new Set<string>();
	const mapKeyLookup = new Map<string, string>();
	if (schemaRow) {
		const schema = JSON.parse(schemaRow.value) as {
			darkGroups?: Array<{ vars?: Record<string, { mapKey?: string }> }>;
		};
		for (const group of schema.darkGroups ?? []) {
			for (const [key, def] of Object.entries(group.vars ?? {})) {
				darkKeys.add(key);
				if (def?.mapKey) mapKeyLookup.set(key, def.mapKey);
			}
		}
	}

	const lightVars: Array<[string, string]> = [];
	const darkVars: Array<[string, string]> = [];

	for (const row of rows) {
		const key = row.name.slice(dbCssPrefix.length);
		const parsed = JSON.parse(row.value) as unknown;
		if (typeof parsed !== "string") continue;
		if (parsed.includes("<")) continue;

		if (darkKeys.has(key)) {
			darkVars.push([key, parsed]);
		} else {
			lightVars.push([key, parsed]);
		}
	}

	if (lightVars.length === 0 && darkVars.length === 0) return "";

	const suffix = addImportant ? " !important" : "";
	const lines: string[] = [];

	if (lightVars.length > 0) {
		lines.push(":root {");
		for (const [key, value] of lightVars) {
			lines.push(`  --${key}: ${value}${suffix};`);
		}
		lines.push("}");
	}

	if (darkVars.length > 0) {
		lines.push("@media (prefers-color-scheme: dark) {");
		lines.push("  :root:not(.light) {");
		for (const [key, value] of darkVars) {
			const cssKey = mapKeyLookup.get(key) ?? key;
			lines.push(`    --${cssKey}: ${value}${suffix};`);
		}
		lines.push("  }");
		lines.push("}");

		lines.push(":root.dark {");
		for (const [key, value] of darkVars) {
			const cssKey = mapKeyLookup.get(key) ?? key;
			lines.push(`  --${cssKey}: ${value}${suffix};`);
		}
		lines.push("}");
	}

	return lines.join("\n");
}
