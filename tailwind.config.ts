import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0F1B16",
          800: "#17251E",
          700: "#1F3126",
        },
        paper: {
          DEFAULT: "#EDE4CE",
          dim: "#DDD2B4",
        },
        amber: {
          DEFAULT: "#E8A33D",
          deep: "#C97F1E",
        },
        sage: "#7FA08C",
        hi: "#F2EFE6",
        lo: "#B7C1B8",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderColor: {
        line: "rgba(242,239,230,0.14)",
        "line-strong": "rgba(242,239,230,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
