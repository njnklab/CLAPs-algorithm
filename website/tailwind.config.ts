import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16212b",
        mist: "#eef3f5",
        paper: "#fbf9f3",
        layer1: "#f97316", // 橙色
        layer2: "#ec4899", // 粉色
        matched: "#1f2937",
        driver: "#f97316",
        dd1: "#60a5fa",
        dd2: "#60a5fa",
        cds: "#f87171",
        cms: "#f87171",
        source: "#3b82f6",
        relay: "#facc15",
        target: "#60a5fa"
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
