import type { Config } from "tailwindcss";
export default {
  content: ["./static/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        lucide: ["LucideIcons"],
      },
    },
  },
  plugins: [
    require("@catppuccin/tailwindcss")({
      prefix: false,
    }),
  ],
} satisfies Config;
