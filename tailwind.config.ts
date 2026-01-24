import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Module accent colors
        body: {
          DEFAULT: 'hsl(var(--body))',
          foreground: 'hsl(var(--body-foreground))',
        },
        time: {
          DEFAULT: 'hsl(var(--time))',
          foreground: 'hsl(var(--time-foreground))',
        },
        medication: {
          DEFAULT: 'hsl(var(--medication))',
          foreground: 'hsl(var(--medication-foreground))',
        },
        pushups: {
          DEFAULT: 'hsl(var(--pushups))',
          foreground: 'hsl(var(--pushups-foreground))',
        },
        dogs: {
          DEFAULT: 'hsl(var(--dogs))',
          foreground: 'hsl(var(--dogs-foreground))',
        },
        oral: {
          DEFAULT: 'hsl(var(--oral))',
          foreground: 'hsl(var(--oral-foreground))',
        },
      },
      borderRadius: {
        'xl': 'var(--radius-xl)',
        'lg': 'var(--radius-lg)',
        DEFAULT: 'var(--radius)',
        'md': 'var(--radius-sm)',
        'sm': 'calc(var(--radius-sm) - 2px)',
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 2px 4px 0 rgb(0 0 0 / 0.04), 0 4px 8px 0 rgb(0 0 0 / 0.04)',
        'elevated': '0 2px 4px 0 rgb(0 0 0 / 0.02), 0 4px 8px 0 rgb(0 0 0 / 0.04), 0 8px 16px 0 rgb(0 0 0 / 0.06), 0 16px 32px 0 rgb(0 0 0 / 0.04)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'celebrate': {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'celebrate': 'celebrate 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
