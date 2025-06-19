import { fontFamily } from 'tailwindcss/defaultTheme';

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
				// Use 'color-' prefix to access DaisyUI colors
				'color-primary': {
					DEFAULT: 'var(--color-primary)',
					base: 'var(--color-primary-base)',
					content: 'var(--color-primary-content)',
				},
				'color-secondary': {
					DEFAULT: 'var(--color-secondary)',
					content: 'var(--color-secondary-content)',
				},
				'color-accent': {
					DEFAULT: 'var(--color-accent)',
					content: 'var(--color-accent-content)',
				},
				'color-neutral': {
					DEFAULT: 'var(--color-neutral)',
					content: 'var(--color-neutral-content)',
				},
				'color-base': {
					'000': 'var(--color-base-000)',
					100: 'var(--color-base-100)',
					200: 'var(--color-base-200)',
					300: 'var(--color-base-300)',
					400: 'var(--color-base-400)',
					content: 'var(--color-base-content)',
					'content-accent': 'var(--color-base-content-accent)',
					premium: 'var(--color-base-premium)',
				},
				'color-info': {
					DEFAULT: 'var(--color-info)',
					content: 'var(--color-info-content)',
				},
				'color-success': {
					DEFAULT: 'var(--color-success)',
					content: 'var(--color-success-content)',
				},
				'color-warning': {
					DEFAULT: 'var(--color-warning)',
					content: 'var(--color-warning-content)',
				},
				'color-error': {
					DEFAULT: 'var(--color-error)',
					content: 'var(--color-error-content)',
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
};

export default config;
