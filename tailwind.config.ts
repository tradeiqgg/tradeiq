import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0C",
        foreground: "#FFFFFF",
        card: {
          DEFAULT: "#111214",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#111214",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#7CFF4F",
          foreground: "#0A0A0A",
        },
        secondary: {
          DEFAULT: "#151618",
          foreground: "#A9A9B3",
        },
        muted: {
          DEFAULT: "#151618",
          foreground: "#6f7177",
        },
        accent: {
          DEFAULT: "#7CFF4F",
          foreground: "#0A0A0A",
        },
        destructive: {
          DEFAULT: "#FF617D",
          foreground: "#FFFFFF",
        },
        border: "#1e1f22",
        input: "#1e1f22",
        ring: "rgba(124, 255, 79, 0.4)",
        success: "#5CFF8C",
        warning: "#E7FF5C",
        error: "#FF617D",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glow-lime": "glow-lime 2s ease-in-out infinite alternate",
        "glow-cyan": "glow-cyan 2s ease-in-out infinite alternate",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        "glow-lime": {
          "0%": { 
            boxShadow: "0 0 5px rgba(57, 255, 20, 0.3), 0 0 10px rgba(57, 255, 20, 0.2)",
            borderColor: "rgba(57, 255, 20, 0.3)",
          },
          "100%": { 
            boxShadow: "0 0 10px rgba(57, 255, 20, 0.6), 0 0 20px rgba(57, 255, 20, 0.4)",
            borderColor: "rgba(57, 255, 20, 0.6)",
          },
        },
        "glow-cyan": {
          "0%": { 
            boxShadow: "0 0 5px rgba(47, 255, 224, 0.3), 0 0 10px rgba(47, 255, 224, 0.2)",
            borderColor: "rgba(47, 255, 224, 0.3)",
          },
          "100%": { 
            boxShadow: "0 0 10px rgba(47, 255, 224, 0.6), 0 0 20px rgba(47, 255, 224, 0.4)",
            borderColor: "rgba(47, 255, 224, 0.6)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

