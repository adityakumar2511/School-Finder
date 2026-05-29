import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        blue: {
          50: "#E6F1FB",
          200: "#85B7EB",
          400: "#378ADD",
          600: "#185FA5",
          800: "#0C447C",
          900: "#042C53",
        },
        amber: {
          50: "#FAEEDA",
          400: "#EF9F27",
          600: "#BA7517",
          800: "#633806",
        },
        gray: {
          50: "#F1EFE8",
          100: "#D3D1C7",
          200: "#B8B6AD",
          400: "#888780",
          500: "#706F69",
          600: "#585751",
          700: "#403F3A",
          800: "#2C2C2A",
          900: "#2C2C2A",
        },
        success: {
          bg: "#EAF3DE",
          text: "#3B6D11",
        },
        warning: {
          bg: "#FAEEDA",
          text: "#854F0B",
        },
        danger: {
          bg: "#FCEBEB",
          text: "#A32D2D",
        },
        info: {
          bg: "#E6F1FB",
          text: "#185FA5",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.15", fontWeight: "700" }],
        "display-md": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["clamp(36px, 4vw, 48px)", { lineHeight: "1.25", fontWeight: "700" }],
        h2: ["clamp(28px, 3vw, 32px)", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["clamp(20px, 2.5vw, 24px)", { lineHeight: "1.35", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.7", fontWeight: "400" }],
        body: ["15px", { lineHeight: "1.7", fontWeight: "400" }],
        label: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        meta: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        btn: ["14px", { lineHeight: "1", fontWeight: "600" }],
      },
      spacing: {
        "section": "2.5rem",
        "card": "1.5rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 12px 0 rgba(24, 95, 165, 0.08)",
        "card-hover": "0 8px 32px 0 rgba(24, 95, 165, 0.16)",
        btn: "0 2px 8px 0 rgba(24, 95, 165, 0.2)",
        amber: "0 2px 8px 0 rgba(239, 159, 39, 0.3)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #042C53 0%, #185FA5 60%, #378ADD 100%)",
        "card-gradient":
          "linear-gradient(180deg, #E6F1FB 0%, #FFFFFF 100%)",
        "amber-gradient":
          "linear-gradient(135deg, #EF9F27 0%, #BA7517 100%)",
        "subtle-pattern":
          "radial-gradient(circle at 20% 50%, rgba(55, 138, 221, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 159, 39, 0.06) 0%, transparent 40%)",
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
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
