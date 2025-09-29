/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#D97706",
        secondary: "#F8D49A",
        tertiary: "#A7C257",
        white: "#FFFFFF",
        black: "#000000",
        dark: "#131313",
        light: "#fffbf2",
      },
    },
  },
  plugins: [],
};
