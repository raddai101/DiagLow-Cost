import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10212B",
        paper: "#F7FAF9",
        line: "#DCE7E4",
        teal: {
          50: "#EEF9F7",
          100: "#D9F1ED",
          500: "#1E8A7A",
          600: "#167567",
          700: "#105D53",
          900: "#083E38"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(16, 33, 43, 0.07)",
        card: "0 4px 20px rgba(16, 33, 43, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;