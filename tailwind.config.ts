import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: {
          50: "#f6f3ee",
          100: "#e9e1d3",
          200: "#d3c2a3",
          300: "#b89a6f",
          400: "#96733f",
          500: "#7a5a2f",
          600: "#5f4525",
          700: "#48331c",
          800: "#332414",
          900: "#20160c",
        },
        leaf: {
          50: "#f0f6ee",
          100: "#dcebd6",
          200: "#b3d6a5",
          300: "#87bf72",
          400: "#5fa347",
          500: "#457d31",
          600: "#356225",
          700: "#284a1c",
          800: "#1c3414",
          900: "#12220c",
        },
        wheat: "#d9a441",
        alert: "#a1361f",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
