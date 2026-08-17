import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        purple: "#8B5CF6",
        "purple-light": "#C4A8FF",
        rose: "#F472B6",
        navy: "#1E1B4B",
      },
      backgroundImage: {
        "veste-gradient": "linear-gradient(135deg, #8B5CF6 0%, #F472B6 100%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float-a": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-b": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-9px)" },
        },
        "float-c": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-d": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "float-a": "float-a 6s ease-in-out infinite",
        "float-b": "float-b 7s ease-in-out infinite 0.5s",
        "float-c": "float-c 5.5s ease-in-out infinite 1s",
        "float-d": "float-d 6.5s ease-in-out infinite 1.5s",
      },
    },
  },
  plugins: [],
};

export default config;
