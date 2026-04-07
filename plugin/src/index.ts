import type { PluginDescriptor } from "emdash";
import { defaultOptions } from "./vars";

/** A single CSS variable definition */
export interface CSSVarDef {
	label: string;
	/** "color" renders a text input, "text" renders number + unit, "select" renders a dropdown */
	type: "color" | "text" | "select";
	default: string;
	/** Required for type "select" — dropdown options */
	options?: Array<{ label: string; value: string }>;
}

/** A group of CSS variables under a heading */
export interface CSSVarGroup {
	/** Heading shown in the admin UI */
	label: string;
	/** Map of CSS custom-property name (without `--`) → definition */
	vars: Record<string, CSSVarDef>;
}

/** Dark-mode overrides. Keys must map back to a light-mode var via `mapKey`. */
export interface DarkOverrideGroup {
	label: string;
	vars: Record<string, CSSVarDef & { /** light-mode CSS var this overrides */ mapKey: string }>;
}

export interface ThemeCustomizerOptions {
	/** Customisable light-mode sections (colours, layout, typography, …) */
	groups: CSSVarGroup[];
	/** Optional dark-mode overrides */
	darkGroups?: DarkOverrideGroup[];
}

/**
 * Theme Customizer plugin — exposes the theme's CSS custom properties
 * in the EmDash admin so site owners can tweak colours, typography, and
 * layout without touching code.
 *
 * Call without arguments to use the defaults from `vars.ts`, or pass
 * overrides if the theme defines a different set of variables.
 */
export function themeCustomizer(
	options: ThemeCustomizerOptions = defaultOptions,
): PluginDescriptor<ThemeCustomizerOptions> {
	return {
		id: "theme-customizer",
		version: "1.0.0",
		format: "standard",
		entrypoint: "@dashstyle/theme-customizer/sandbox",
		options,
		capabilities: ["page:inject"],
		adminPages: [{ path: "/", label: "Theme" }],
	};
}
