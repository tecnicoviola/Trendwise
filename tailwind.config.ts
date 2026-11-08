import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        editorial: {
          text: "var(--text)",
          "text-2": "var(--text-2)",
          muted: "var(--muted)",
          accent: "var(--accent)",
          "accent-strong": "var(--accent-strong)",
          border: "var(--border)",
          success: "var(--success)",
          warning: "var(--warning)",
          error: "var(--error)",
        },
        trend: {
          "butter-yellow": {
            swatch: "#F4E4A6",
            line: "var(--color-butter-yellow-line)",
          },
          burgundy: {
            swatch: "#7A1F32",
            line: "var(--color-burgundy-line)",
          },
          "chocolate-brown": {
            swatch: "#4A2C20",
            line: "var(--color-chocolate-brown-line)",
          },
          "powder-blue": {
            swatch: "#B7D0E3",
            line: "var(--color-powder-blue-line)",
          },
          "sage-green": {
            swatch: "#9DB08A",
            line: "var(--color-sage-green-line)",
          },
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        control: "8px",
        panel: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
