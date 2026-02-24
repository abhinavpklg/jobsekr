import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#161b22",
        accent: "#58a6ff",
        "green-bright": "#3fb950",
        "red-bright": "#f85149",
      },
    },
  },
  plugins: [],
};

export default config;