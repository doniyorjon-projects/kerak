/** @type {import('tailwindcss').Config} */

function withOpacity(cssVar) {
  return ({ opacityValue }) =>
    opacityValue !== undefined ? `rgb(var(${cssVar}) / ${opacityValue})` : `rgb(var(${cssVar}))`;
}

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: withOpacity("--tg-button"),
          contrast: withOpacity("--tg-button-text"),
        },
        link: withOpacity("--tg-link"),
        app: withOpacity("--tg-bg"),
        surface: withOpacity("--tg-section-bg"),
        "surface-secondary": withOpacity("--tg-secondary-bg"),
        ink: withOpacity("--tg-text"),
        hint: withOpacity("--tg-hint"),
        divider: "var(--tg-border)",
        destructive: withOpacity("--tg-destructive"),
        success: {
          DEFAULT: withOpacity("--tg-success"),
          dark: "#059669",
        },
        promo: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 6px 16px -4px rgb(0 0 0 / 0.08)",
        float: "0 8px 24px -4px rgb(0 0 0 / 0.18), 0 2px 8px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
