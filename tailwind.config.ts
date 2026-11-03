import type { Config } from "tailwindcss";
import tokens from "./design/tokens.json";

// Thermal design system (DESIGN.md). Every hue Tailwind ships is folded onto the
// system's six scales, so a stray `text-purple-500` in an old component renders in
// the system's own colour instead of off-brand purple.
const { ink, ember, steel, moss, amber, brick } = tokens.color.scales;
const scale = ({ usage: _usage, ...steps }: Record<string, string>) => steps;
const INK = scale(ink);
const EMBER = scale(ember);
const STEEL = scale(steel);
const MOSS = scale(moss);
const AMBER = scale(amber);
const BRICK = scale(brick);

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hebrew: ['Rubik', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        geist: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        rubik: ['Rubik', 'Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        // The system's scales and their legacy aliases.
        ink: INK,
        ember: EMBER,
        steel: STEEL,
        moss: MOSS,
        brick: BRICK,
        amber: AMBER,
        gray: INK,
        slate: INK,
        zinc: INK,
        neutral: INK,
        stone: INK,
        grey: INK,
        blue: STEEL,
        indigo: STEEL,
        sky: STEEL,
        cyan: STEEL,
        violet: STEEL,
        purple: STEEL,
        fuchsia: STEEL,
        orange: EMBER,
        green: MOSS,
        emerald: MOSS,
        teal: MOSS,
        lime: MOSS,
        yellow: AMBER,
        red: BRICK,
        rose: BRICK,
        pink: BRICK,
        error: BRICK,
        success: { ...MOSS, DEFAULT: "var(--success)" },
        warning: { ...AMBER, DEFAULT: "var(--warning)" },
        danger: "var(--danger)",
        info: "var(--info)",
        whatsapp: {
          bubble: "var(--whatsapp-bubble)",
          "bubble-foreground": "var(--whatsapp-bubble-foreground)",
          accent: "var(--whatsapp-accent)",
        },
        paper: "var(--paper)",
        surface: "var(--surface)",
        sunken: "var(--surface-sunken)",
        subtle: "var(--text-secondary)",
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        action: { DEFAULT: "var(--action)", hover: "var(--action-hover)", soft: "var(--action-soft)" },
        heat: {
          cold: "var(--heat-cold)",
          cool: "var(--heat-cool)",
          warm: "var(--heat-warm)",
          hot: "var(--heat-hot)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          ...EMBER,
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          ...STEEL,
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Two elevations only: raised (hovered card) and float (popover, dialog).
      // The legacy shadow names resolve onto them so old cards stop shouting.
      boxShadow: {
        sm: "var(--shadow-raised)",
        DEFAULT: "var(--shadow-raised)",
        md: "var(--shadow-raised)",
        lg: "var(--shadow-float)",
        xl: "var(--shadow-float)",
        "2xl": "var(--shadow-float)",
        raised: "var(--shadow-raised)",
        float: "var(--shadow-float)",
        "card-1": "var(--shadow-raised)",
        "card-2": "var(--shadow-raised)",
        "card-3": "var(--shadow-float)",
        "card-hover": "var(--shadow-float)",
      },
      // Controls 6, surfaces 10, pills full (DESIGN.md, "Radius").
      borderRadius: {
        sm: "4px",
        DEFAULT: "var(--radius-control)",
        md: "var(--radius-control)",
        lg: "var(--radius-surface)",
        xl: "var(--radius-surface)",
        "2xl": "var(--radius-surface)",
        "3xl": "var(--radius-surface)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          from: {
            "background-position": "0 0",
          },
          to: {
            "background-position": "-200% 0",
          },
        },
        "background-position-spin": {
          "0%": { backgroundPosition: "top center" },
          "100%": { backgroundPosition: "bottom center" },
        },
        orbit: {
          "0%": {
            transform:
              "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform:
              "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "background-position-spin": "background-position-spin 3000ms infinite alternate",
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": EMBER["500"],
          "primary-content": "#ffffff",
          "secondary": STEEL["600"],
          "secondary-content": "#ffffff",
          "accent": EMBER["500"],
          "accent-content": "#ffffff",
          "neutral": INK["700"],
          "neutral-content": INK["50"],
          "base-100": "#ffffff",
          "base-200": "#FAFBFC",
          "base-300": INK["200"],
          "base-content": INK["900"],
          "info": STEEL["600"],
          "info-content": "#ffffff",
          "success": MOSS["600"],
          "success-content": "#ffffff",
          "warning": AMBER["500"],
          "warning-content": "#ffffff",
          "error": BRICK["600"],
          "error-content": "#ffffff",
        },
        dark: {
          "primary": "#E8784C",
          "primary-content": INK["950"],
          "secondary": STEEL["300"],
          "secondary-content": INK["950"],
          "accent": "#E8784C",
          "accent-content": INK["950"],
          "neutral": INK["800"],
          "neutral-content": INK["100"],
          "base-100": INK["950"],
          "base-200": INK["900"],
          "base-300": INK["800"],
          "base-content": INK["100"],
          "info": STEEL["300"],
          "info-content": INK["950"],
          "success": MOSS["300"],
          "success-content": INK["950"],
          "warning": AMBER["300"],
          "warning-content": INK["950"],
          "error": BRICK["300"],
          "error-content": INK["950"],
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};

export default config; 