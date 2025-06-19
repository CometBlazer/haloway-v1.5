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
				// core tokens
				border: 'hsl(var(--border)   / <alpha-value>)',
				input: 'hsl(var(--input)    / <alpha-value>)',
				ring: 'hsl(var(--ring)     / <alpha-value>)',
				background: 'hsl(var(--background)/ <alpha-value>)',
				foreground: 'hsl(var(--foreground)/ <alpha-value>)',

				// primary / secondary / etc
				primary: {
					DEFAULT: 'hsl(var(--primary)            / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground)/ <alpha-value>)',
				},
				'primary-base': 'hsl(var(--color-primary-base)     / <alpha-value>)',
				'primary-content': 'hsl(var(--color-primary-content)  / <alpha-value>)',

				secondary: {
					DEFAULT: 'hsl(var(--secondary)            / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground)/ <alpha-value>)',
				},
				'secondary-content': 'hsl(var(--secondary-content)/ <alpha-value>)',

				destructive: {
					DEFAULT: 'hsl(var(--destructive)            / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground)/ <alpha-value>)',
				},

				muted: {
					DEFAULT: 'hsl(var(--muted)            / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground)/ <alpha-value>)',
				},

				accent: {
					DEFAULT: 'hsl(var(--accent)            / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground)/ <alpha-value>)',
				},
				'accent-content': 'hsl(var(--color-accent-content)   / <alpha-value>)',

				popover: {
					DEFAULT: 'hsl(var(--popover)            / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground)/ <alpha-value>)',
				},

				card: {
					DEFAULT: 'hsl(var(--card)            / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground)/ <alpha-value>)',
				},

				// neutral / base shades
				neutral: 'hsl(var(--color-neutral)         / <alpha-value>)',
				'neutral-content': 'hsl(var(--color-neutral-content) / <alpha-value>)',

				'base-000': 'hsl(var(--color-base-000)            / <alpha-value>)',
				'base-100': 'hsl(var(--color-base-100)            / <alpha-value>)',
				'base-200': 'hsl(var(--color-base-200)            / <alpha-value>)',
				'base-300': 'hsl(var(--color-base-300)            / <alpha-value>)',
				'base-400': 'hsl(var(--color-base-400)            / <alpha-value>)',
				'base-content': 'hsl(var(--color-base-content)        / <alpha-value>)',
				'base-content-accent':
					'hsl(var(--color-base-content-accent)/ <alpha-value>)',
				'base-premium': 'hsl(var(--color-base-premium)        / <alpha-value>)',

				// feedback colors
				info: 'hsl(var(--color-info)             / <alpha-value>)',
				'info-content': 'hsl(var(--color-info-content)     / <alpha-value>)',
				success: 'hsl(var(--color-success)          / <alpha-value>)',
				'success-content': 'hsl(var(--color-success-content)  / <alpha-value>)',
				warning: 'hsl(var(--color-warning)          / <alpha-value>)',
				'warning-content': 'hsl(var(--color-warning-content)  / <alpha-value>)',
				error: 'hsl(var(--color-error)            / <alpha-value>)',
				'error-content': 'hsl(var(--color-error-content)    / <alpha-value>)',
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
