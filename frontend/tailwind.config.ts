import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        surface: "var(--bg-surface)",
        "surface-hover": "var(--bg-surface-hover)",
        elevated: "var(--bg-elevated)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        "t-primary": "var(--text-primary)",
        "t-secondary": "var(--text-secondary)",
        "t-muted": "var(--text-muted)",
        "t-inverse": "var(--text-inverse)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-muted": "var(--accent-muted)",
        "green-bright": "var(--green)",
        "green-muted": "var(--green-muted)",
        "red-bright": "var(--red)",
        "red-muted": "var(--red-muted)",
        "yellow-bright": "var(--yellow)",
        "yellow-muted": "var(--yellow-muted)",
        "purple-bright": "var(--purple)",
        "purple-muted": "var(--purple-muted)",
      },
    },
  },
  plugins: [],
};

export default config;