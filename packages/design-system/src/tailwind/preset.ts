import type { Config } from "tailwindcss";

export const fluxiTailwindPreset: Partial<Config> = {
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Transducer", "Inter", "sans-serif"]
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-bg))",
          foreground: "hsl(var(--sidebar-fg))",
          accent: "hsl(var(--sidebar-accent))",
          border: "hsl(var(--sidebar-border))"
        },
        status: {
          available: "hsl(var(--status-available))",
          reserved: "hsl(var(--status-reserved))",
          sold: "hsl(var(--status-sold))",
          blocked: "hsl(var(--status-blocked))",
          negotiation: "hsl(var(--status-negotiation))",
          permuta: "hsl(var(--status-permuta))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-shell": "var(--gradient-shell)"
      },
      boxShadow: {
        sm: "var(--elevation-1)",
        md: "var(--elevation-2)",
        lg: "var(--elevation-3)"
      }
    }
  }
};

export default fluxiTailwindPreset;

