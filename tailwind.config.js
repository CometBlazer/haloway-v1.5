import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
		extend: {
			colors: {
				// ===== SHADCN COLORS =====
				// Core tokens
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',

				// Primary / secondary / etc (shadcn)
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
				},

				// ===== LEGACY DAISYUI COLORS =====
				// Use 'color-' prefix to access DaisyUI colors (now with opacity support)
				'color-primary': {
					DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
					base: 'hsl(var(--color-primary-base) / <alpha-value>)',
					content: 'hsl(var(--color-primary-content) / <alpha-value>)',
				},
				'color-secondary': {
					DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
					content: 'hsl(var(--color-secondary-content) / <alpha-value>)',
				},
				'color-accent': {
					DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
					content: 'hsl(var(--color-accent-content) / <alpha-value>)',
				},
				'color-neutral': {
					DEFAULT: 'hsl(var(--color-neutral) / <alpha-value>)',
					content: 'hsl(var(--color-neutral-content) / <alpha-value>)',
				},
				'color-base': {
					'000': 'hsl(var(--color-base-000) / <alpha-value>)',
					100: 'hsl(var(--color-base-100) / <alpha-value>)',
					200: 'hsl(var(--color-base-200) / <alpha-value>)',
					300: 'hsl(var(--color-base-300) / <alpha-value>)',
					400: 'hsl(var(--color-base-400) / <alpha-value>)',
					content: 'hsl(var(--color-base-content) / <alpha-value>)',
					'content-accent':
						'hsl(var(--color-base-content-accent) / <alpha-value>)',
					premium: 'hsl(var(--color-base-premium) / <alpha-value>)',
				},
				'color-info': {
					DEFAULT: 'hsl(var(--color-info) / <alpha-value>)',
					content: 'hsl(var(--color-info-content) / <alpha-value>)',
				},
				'color-success': {
					DEFAULT: 'hsl(var(--color-success) / <alpha-value>)',
					content: 'hsl(var(--color-success-content) / <alpha-value>)',
				},
				'color-warning': {
					DEFAULT: 'hsl(var(--color-warning) / <alpha-value>)',
					content: 'hsl(var(--color-warning-content) / <alpha-value>)',
				},
				'color-error': {
					DEFAULT: 'hsl(var(--color-error) / <alpha-value>)',
					content: 'hsl(var(--color-error-content) / <alpha-value>)',
				},
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},

			fontFamily: { sans: [...fontFamily.sans] },
		},
	},
	plugins: [
		typography,
		// ... your other plugins
	],
};

export default config;
