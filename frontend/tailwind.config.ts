import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1B3A4B",
          hover: "#142C3A",
          dark: "#0F2430",
        },
        alabaster: "#F8F7F4",
        sage: { DEFAULT: "#E8EEE8", deep: "#D5DFD4" },
        leaf: { DEFAULT: "#D7E6EE", deep: "#2F5D73" },
        gold: { DEFAULT: "#D7E6EE", deep: "#2F5D73", star: "#C6A15A" },
        argan: "#C6A15A",
        coral: "#8C4E45",
        wa: "#25D366",
        muted: "#5A6B73",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        arabic: ["var(--font-cairo)", "Tahoma", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,36,48,.04), 0 10px 28px -12px rgba(15,36,48,.12)",
        lift: "0 18px 40px -14px rgba(27,58,75,.30)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pop-in": { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        shrink: { from: { transform: "scaleX(1)" }, to: { transform: "scaleX(0)" } },
        "pulse-soft": { "0%,100%": { opacity: "1" }, "50%": { opacity: ".55" } },
      },
      animation: {
        "fade-up": "fade-up .5s ease-out both",
        "pop-in": "pop-in .22s ease-out both",
        "slide-in-left": "slide-in-left .3s cubic-bezier(.22,.8,.3,1) both",
        shrink: "shrink linear forwards",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
