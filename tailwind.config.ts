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
        paper: "#FFF8F6",
        surface: "#FFFFFF",
        ink: "#2B2230",
        "ink-muted": "#8A7C86",
        line: "#F0E1E6",
        brand: {
          DEFAULT: "#D94F80",
          dark: "#B93A69",
          light: "#FDEAF1",
        },
        success: {
          DEFAULT: "#1E9E6B",
          light: "#E3F7EE",
        },
        danger: {
          DEFAULT: "#D9634F",
          light: "#FCEAE6",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 34, 48, 0.06), 0 1px 12px rgba(43, 34, 48, 0.06)",
        sheet: "0 -4px 24px rgba(43, 34, 48, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
