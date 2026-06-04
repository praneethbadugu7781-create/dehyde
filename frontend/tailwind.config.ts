import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#000000",
        stone: "#1f1f1f",
        muted: "#787878",
        cream: "#ffffff",
        offwhite: "#f8f8f8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        display: ["var(--font-display)", "sans-serif"],
        campton: ["Campton", "sans-serif"],
      },
      spacing: {
        section: "clamp(5rem, 12vw, 7.5rem)",
        gutter: "clamp(1.5rem, 4vw, 7.5rem)",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      letterSpacing: {
        editorial: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
