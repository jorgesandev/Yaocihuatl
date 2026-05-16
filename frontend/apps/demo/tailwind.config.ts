import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "surface-soft": "var(--surface-soft)",
        "surface-card": "var(--surface-card)",
        "surface-raised": "var(--surface-raised)",
        overlay: "var(--overlay)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          hover: "var(--secondary-hover)"
        },
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
          950: "var(--brand-950)"
        },
        success: {
          100: "var(--success-100)",
          600: "var(--success-600)",
          700: "var(--success-700)"
        },
        warning: {
          100: "var(--warning-100)",
          700: "var(--warning-700)"
        },
        danger: {
          100: "var(--danger-100)",
          700: "var(--danger-700)"
        },
        info: {
          100: "var(--info-100)",
          700: "var(--info-700)"
        },
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)"
        }
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"]
      },
      backgroundImage: {
        "gradient-brand-radial":
          "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(180,97,198,0.18) 0%, transparent 70%)",
        "gradient-cta":
          "linear-gradient(135deg, var(--brand-700) 0%, var(--brand-500) 100%)"
      },
      animation: {
        "fade-in-up": "fade-in-up 0.28s var(--ease-standard) both",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite"
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" }
        }
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)"
      }
    }
  },
  plugins: []
};

export default config;
