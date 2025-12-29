/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Cores de marca
        primary: {
          DEFAULT: "#9242CC", // cor roxa principal
          light90: "#F4ECFA",
          light80: "#E9D9F5",
          light60: "#D3B3EB",
          light50: "#C9A0E5",
          light40: "#BE8EE0",
          light10: "#9D55D1",
          dark10: "#7535A3",
          dark40: "#58287A",
          dark50: "#492166",
          dark60: "#3A1A52",
          dark80: "#1D0D29",
          dark90: "#0F0714"
        },
        // cor erro
        error: {
          DEFAULT: "#D34A4A", // vermelho
          light75: "#F4D2D2",
          light50: "#E9A4A4",
          dark50: "#6A2525",
          dark75: "#351313"
        },
        // cor neutras
        neutral: {
          black: "#000000",
          white: "#ffffff",
          dark50: "#6A2525",
          dark75: "#351313"
        },
        // cor fundo
        background: {
          DEFAULT: "#222734",
        },
        // cinza
        "gray-navbar": {
          DEFAULT: "#303B49",
        }
      }
    }
  },
  plugins: []
}

