import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#1a1a1a",
        stone: "#2a2a2a",
        muted: "#8a8a8a",
        cream: "#f5f3ef",
        offwhite: "#faf9f7",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Avenir Next", "Montserrat", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Didot", "serif"],
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
