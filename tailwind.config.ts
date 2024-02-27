import type { Config } from "tailwindcss";
export default {
  content: ["./static/**/*.{html,js}"],
  theme: {
    extend: {
      // themes:{

      //  },
      fontFamily: {
        sans: ["Geist", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@catppuccin/tailwindcss")({
      prefix: false,
    }),
    require("flowbite/plugin"),
  ],
} satisfies Config;
