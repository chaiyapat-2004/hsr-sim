import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hsr: {
          bg: "#0a0d14",
          card: "#121722",
          panel: "#161c2b",
          border: "#26334d",
          accent: "#d4af37",
          gold: "#ffd700",
          purple: "#a855f7",
          blue: "#3b82f6",
          jade: "#00f0ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
