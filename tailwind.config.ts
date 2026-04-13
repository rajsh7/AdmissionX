import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        primary: "#FF3C3C",
        "primary-dark": "#E63535",
        "primary-light": "#FFF3F3",
        "background-light": "#FAFAFA",
        "background-dark": "#0A0A0A",
        "admin-blue": "#1E88E5",
        "admin-dark": "#313131",
        "admin-header": "#444444",
        "admin-stripe": "#EAF4FF",
        maroon: {
          DEFAULT: "#8B3D3D",
          dark: "#6B2424",
          light: "#A34F4F",
        },
        sidebar: {
          dark: "#262626",
          light: "#2b2b2b",
        },
        teal: {
          DEFAULT: "#00b5ad",
          light: "#e6f8f7",
          dark: "#009b95",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "10px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
