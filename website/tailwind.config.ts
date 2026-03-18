import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        layer1: "rgb(var(--color-layer1) / <alpha-value>)",
        layer2: "rgb(var(--color-layer2) / <alpha-value>)",
        matched: "rgb(var(--color-matched) / <alpha-value>)",
        driver: "rgb(var(--color-driver) / <alpha-value>)",
        dd1: "rgb(var(--color-dd1) / <alpha-value>)",
        dd2: "rgb(var(--color-dd2) / <alpha-value>)",
        cds: "rgb(var(--color-cds) / <alpha-value>)",
        cms: "rgb(var(--color-cms) / <alpha-value>)",
        source: "rgb(var(--color-source) / <alpha-value>)",
        relay: "rgb(var(--color-relay) / <alpha-value>)",
        target: "rgb(var(--color-target) / <alpha-value>)"
      },
      boxShadow: {
        card: "0 30px 80px -40px rgba(22, 33, 43, 0.25)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 10% 20%, rgba(249,115,22,0.12), transparent 28%), radial-gradient(circle at 90% 0%, rgba(236,72,153,0.1), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(238,243,245,0.72))"
      }
    }
  },
  plugins: []
};

export default config;
