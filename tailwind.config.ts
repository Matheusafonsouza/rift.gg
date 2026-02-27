import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        void: {
          DEFAULT: "#070A13",
          50:  "#0f1525",
          100: "#0b1020",
          200: "#080d1a",
          300: "#070A13",
        },
        ink: {
          DEFAULT: "#0D1117",
          light: "#111926",
          mid:   "#1a2436",
          subtle:"#0f141e",
        },
        gold: {
          DEFAULT: "#C89B3C",
          light:   "#E8C96C",
          dim:     "#96722A",
          faint:   "#C89B3C1A",
          border:  "#C89B3C33",
        },
        // League regional accent colors
        electric: "#0BC4E3",
        "electric-dim": "#0BC4E322",
        crimson:  "#E84057",
        emerald:  "#1FBF6E",
        // Text hierarchy
        text: {
          primary:   "#E8D9B4",
          secondary: "#9BAABB",
          muted:     "#4A5A6B",
          faint:     "#2A3545",
        },
        // League region colors
        lck:  "#0BC4E3",
        lpl:  "#E84057",
        lec:  "#1e90ff",
        lcs:  "#9b59b6",
        cblol:"#1FBF6E",
        int:  "#C89B3C",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        body:    ["var(--font-barlow)", "system-ui", "sans-serif"],
        cond:    ["var(--font-barlow-condensed)", "system-ui", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        "xs":  ["11px", { lineHeight: "16px" }],
        "sm":  ["12px", { lineHeight: "18px" }],
        "base":["13px", { lineHeight: "20px" }],
        "md":  ["14px", { lineHeight: "20px" }],
        "lg":  ["16px", { lineHeight: "24px" }],
        "xl":  ["18px", { lineHeight: "26px" }],
        "2xl": ["22px", { lineHeight: "30px" }],
        "3xl": ["28px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
      },
      backgroundImage: {
        "hex-pattern": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31L28 64z' fill='%23C89B3C' fill-opacity='0.04'/%3E%3C/svg%3E\")",
        "void-gradient": "linear-gradient(180deg, #0D1117 0%, #070A13 100%)",
        "gold-shimmer":  "linear-gradient(135deg, #C89B3C 0%, #E8C96C 50%, #96722A 100%)",
      },
      boxShadow: {
        "gold-glow":   "0 0 20px #C89B3C22",
        "gold-border": "inset 0 0 0 1px #C89B3C33",
        "panel":       "0 1px 0 0 #1a2436, 0 -1px 0 0 #1a2436",
        "live":        "0 0 8px #E84057",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { boxShadow: "0 0 0 0 #E8405744" },
          "50%":      { boxShadow: "0 0 0 6px #E8405700" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 1.6s ease-in-out infinite",
        "fade-up":    "fade-up 0.4s ease forwards",
        "shimmer":    "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
