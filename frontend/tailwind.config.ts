import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0D9488",
          hover: "#0F766E",
          dark: "#1E293B",
        },
        action: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
        },
        alabaster: "#F8FAFC",
        sage: { DEFAULT: "#CCFBF1", deep: "#99F6E4" },
        leaf: { DEFAULT: "#99F6E4", deep: "#0D9488" },
        gold: { DEFAULT: "#CCFBF1", deep: "#0D9488", star: "#F59E0B" },
        argan: "#F59E0B",
        coral: "#C2410C",
        wa: "#25D366",
        muted: "#475569",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        arabic: ["var(--font-cairo)", "Tahoma", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,41,59,.04), 0 12px 28px -14px rgba(30,41,59,.16)",
        lift: "0 18px 40px -14px rgba(249,115,22,.38)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pop-in": { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "drop-down": { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shrink: { from: { transform: "scaleX(1)" }, to: { transform: "scaleX(0)" } },
        "pulse-soft": { "0%,100%": { opacity: "1" }, "50%": { opacity: ".55" } },
      },
      animation: {
        "fade-up": "fade-up .5s ease-out both",
        "pop-in": "pop-in .22s ease-out both",
        "slide-in-left": "slide-in-left .3s cubic-bezier(.22,.8,.3,1) both",
        "drop-down": "drop-down .18s ease-out both",
        shrink: "shrink linear forwards",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
