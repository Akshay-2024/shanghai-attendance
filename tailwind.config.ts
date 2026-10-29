import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dojo: {
          bg: "#0a0a0f",
          surface: "#12121a",
          card: "#1a1a26",
          border: "rgba(255,255,255,0.08)",
          crimson: "#c0392b",
          "crimson-dark": "#96281b",
          "crimson-light": "#e74c3c",
          gold: "#f39c12",
          "gold-light": "#f1c40f",
          text: "#e8e8f0",
          muted: "#8888aa",
          glass: "rgba(255,255,255,0.05)",
        },
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(192,57,43,0.35)",
        "glow-sm": "0 0 20px rgba(192,57,43,0.2)",
        "gold-glow": "0 0 30px rgba(243,156,18,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
        pulse_slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "dojo-gradient":
          "linear-gradient(135deg, #0a0a0f 0%, #1a0a08 50%, #0a0a0f 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
