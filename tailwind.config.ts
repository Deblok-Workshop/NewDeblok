import type { Config } from "tailwindcss";
export default {
  content: ["./static/**/*.{html,js}"],
  theme: {
    colors: {
      crust: '#000',  
      mantle: '#000',  
      base: '#0f0f0f',  
      surface0: '#1f1f1f',  
      surface1: '#2f2f2f', 
      surface2: '#3f3f3f', 
      overlay0: '#4f4f4f', 
      overlay1: '#5f5f5f', 
      overlay2: '#6f6f6f', 
      rosewater: '#dc8a78', 
      flamingo: '#dd7878', 
      pink: '#ea76cb', 
      mauve: '#8839ef',
      red: '#d20f39', 
      maroon: '#e64553',
      peach: '#fe640b', 
      yellow: '#df8e1d',
      green: '#40a02b',
      teal: '#179299', 
      sky: '#04a5e5', 
      sapphire: '#209fb5',
      blue: '#1e66f5',
      lavender: '#7287fd',
      text: '#eeeeee', 
      subtext1: '#cccccc', 
      subtext0: '#bbbbbb'
    },
    extend: {
     // themes:{
      
  //  },
      fontFamily: {
        sans: ["Geist","sans-serif"],
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
