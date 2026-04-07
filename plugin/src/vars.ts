import type { ThemeCustomizerOptions } from "./index";

/**
 * Default variable schema for the DashStyle theme.
 *
 * Defined in its own module so both the Vite-time descriptor (`index.ts`)
 * and the workerd-time sandbox entry (`sandbox-entry.ts`) can import it
 * without relying on `globalThis` — which doesn't survive across the
 * Node → workerd runtime boundary used by the Cloudflare adapter.
 */
export const defaultOptions: ThemeCustomizerOptions = {
	groups: [
		{
			label: "Colors",
			vars: {
				"color-bg": { label: "Background", type: "color", default: "#ffffff" },
				"color-text": { label: "Text", type: "color", default: "#0f172a" },
				"color-muted": { label: "Muted Text", type: "color", default: "#64748b" },
				"color-border": { label: "Border", type: "color", default: "#e2e8f0" },
				"color-surface": { label: "Surface", type: "color", default: "#f8fafc" },
				"color-primary": { label: "Primary", type: "color", default: "#6366f1" },
				"color-primary-dark": { label: "Primary Dark", type: "color", default: "#4f46e5" },
				"color-primary-light": { label: "Primary Light", type: "color", default: "#818cf8" },
				"color-accent": { label: "Accent", type: "color", default: "#f472b6" },
				"color-accent-light": { label: "Accent Light", type: "color", default: "#f9a8d4" },
				"color-success": { label: "Success", type: "color", default: "#22c55e" },
				"color-warning": { label: "Warning", type: "color", default: "#f59e0b" },
			},
		},
		{
			label: "Typography",
			vars: {
				"font-size-xs": { label: "XS Font Size", type: "text", default: "0.75rem" },
				"font-size-sm": { label: "Small Font Size", type: "text", default: "0.875rem" },
				"font-size-base": { label: "Base Font Size", type: "text", default: "1rem" },
				"font-size-lg": { label: "Large Font Size", type: "text", default: "1.125rem" },
				"font-size-xl": { label: "XL Font Size", type: "text", default: "1.25rem" },
				"font-size-2xl": { label: "2XL Font Size", type: "text", default: "1.5rem" },
				"font-size-3xl": { label: "3XL Font Size", type: "text", default: "2rem" },
				"font-size-4xl": { label: "4XL Font Size", type: "text", default: "2.5rem" },
				"font-size-5xl": { label: "5XL Font Size", type: "text", default: "3.5rem" },
				"font-size-6xl": { label: "6XL Font Size", type: "text", default: "4.5rem" },
			},
		},
		{
			label: "Layout",
			vars: {
				"max-width": { label: "Content Width", type: "text", default: "720px" },
				"wide-width": { label: "Wide Width", type: "text", default: "1200px" },
				"radius-sm": { label: "Border Radius (sm)", type: "text", default: "6px" },
				"radius": { label: "Border Radius", type: "text", default: "10px" },
				"radius-lg": { label: "Border Radius (lg)", type: "text", default: "16px" },
			},
		},
		{
			label: "Spacing",
			vars: {
				"spacing-xs": { label: "XS Spacing", type: "text", default: "0.25rem" },
				"spacing-sm": { label: "Small Spacing", type: "text", default: "0.5rem" },
				"spacing-md": { label: "Medium Spacing", type: "text", default: "1rem" },
				"spacing-lg": { label: "Large Spacing", type: "text", default: "1.5rem" },
				"spacing-xl": { label: "XL Spacing", type: "text", default: "2rem" },
				"spacing-2xl": { label: "2XL Spacing", type: "text", default: "3rem" },
				"spacing-3xl": { label: "3XL Spacing", type: "text", default: "4rem" },
				"spacing-4xl": { label: "4XL Spacing", type: "text", default: "6rem" },
				"spacing-5xl": { label: "5XL Spacing", type: "text", default: "8rem" },
			},
		},
		{
			label: "Fonts",
			vars: {
				"font-sans": {
					label: "Sans-serif Font",
					type: "select",
					default: "Inter",
					options: [
						{ label: "Inter (default)", value: "Inter" },
						{ label: "Roboto", value: "Roboto" },
						{ label: "Open Sans", value: "Open Sans" },
						{ label: "Lato", value: "Lato" },
						{ label: "Poppins", value: "Poppins" },
						{ label: "Montserrat", value: "Montserrat" },
						{ label: "Source Sans 3", value: "Source Sans 3" },
						{ label: "Merriweather (serif)", value: "Merriweather" },
						{ label: "System UI", value: "system-ui" },
					],
				},
			},
		},
	],
	darkGroups: [
		{
			label: "Dark Mode Colors",
			vars: {
				"dark-color-bg": { label: "Background (Dark)", type: "color", default: "#0f172a", mapKey: "color-bg" },
				"dark-color-text": { label: "Text (Dark)", type: "color", default: "#f1f5f9", mapKey: "color-text" },
				"dark-color-muted": { label: "Muted Text (Dark)", type: "color", default: "#94a3b8", mapKey: "color-muted" },
				"dark-color-border": { label: "Border (Dark)", type: "color", default: "#334155", mapKey: "color-border" },
				"dark-color-surface": { label: "Surface (Dark)", type: "color", default: "#1e293b", mapKey: "color-surface" },
				"dark-color-primary": { label: "Primary (Dark)", type: "color", default: "#818cf8", mapKey: "color-primary" },
				"dark-color-primary-dark": { label: "Primary Dark (Dark)", type: "color", default: "#6366f1", mapKey: "color-primary-dark" },
				"dark-color-primary-light": { label: "Primary Light (Dark)", type: "color", default: "#a5b4fc", mapKey: "color-primary-light" },
			},
		},
	],
};
