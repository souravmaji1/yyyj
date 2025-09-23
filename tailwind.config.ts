import type { Config } from "tailwindcss";
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
     
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Brand Design Tokens - mapped from CSS variables
        brand: {
          50: 'var(--brand-primary-50)',
          100: 'var(--brand-primary-100)',
          600: 'var(--brand-primary-600)',
          700: 'var(--brand-primary-700)',
          800: 'var(--brand-primary-800)',
        },
        'brand-secondary': {
          50: 'var(--brand-secondary-50)',
          600: 'var(--brand-secondary-600)',
          700: 'var(--brand-secondary-700)',
          800: 'var(--brand-secondary-800)',
        },
        success: { 
          600: 'var(--brand-success-600)',
          700: 'var(--brand-success-700)',
        },
        warning: { 
          600: 'var(--brand-warning-600)',
          700: 'var(--brand-warning-700)',
        },
        danger: { 
          600: 'var(--brand-danger-600)',
          700: 'var(--brand-danger-700)',
        },
        neutral: {
          25: 'var(--brand-neutral-25)',
          50: 'var(--brand-neutral-50)',
          100: 'var(--brand-neutral-100)',
          700: 'var(--brand-neutral-700)',
          800: 'var(--brand-neutral-800)',
          900: 'var(--brand-neutral-900)',
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        marquee: {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-50%)",
          },
        },
        "marquee-reverse": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(50%)",
          },
        },
          'scroll': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' }
  },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee-infinite": "marquee 40s linear infinite",
        "marquee-infinite-reverse": "marquee-reverse 40s linear infinite",
        'scroll': 'scroll 60s linear infinite'
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
