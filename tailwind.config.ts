import type { Config } from "tailwindcss";
export default {
  content: ["./static/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist"],
      },
    },
  },
  plugins: [
    require("@catppuccin/tailwindcss")({
      prefix: false,
    }),
    require('flowbite/plugin')
  ],
} satisfies Config;
