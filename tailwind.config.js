/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#f29200",
        secondary: "#f8d49a",
        tertiary: "#a7c257",
        dark: "#131313",
        light: "#fffbf0",
      },
    },
  },
  plugins: [],
};

// main
// dev-tati
// dev-luca
