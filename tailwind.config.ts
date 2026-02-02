import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Pillar colors
        physical: {
          from: "#667eea",
          to: "#764ba2",
        },
        mental: {
          from: "#f093fb",
          to: "#f5576c",
        },
        fiscal: {
          from: "#4facfe",
          to: "#00f2fe",
        },
        // Glass colors
        glass: {
          bg: "rgba(255, 255, 255, 0.1)",
          border: "rgba(255, 255, 255, 0.2)",
          dark: {
            bg: "rgba(0, 0, 0, 0.2)",
            border: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
      backgroundImage: {
        "gradient-physical": "linear-gradient(135deg, #667eea, #764ba2)",
        "gradient-mental": "linear-gradient(135deg, #f093fb, #f5576c)",
        "gradient-fiscal": "linear-gradient(135deg, #4facfe, #00f2fe)",
        "gradient-main": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        "gradient-light": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
        "glass-lg": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        glow: "0 0 40px rgba(102, 126, 234, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
