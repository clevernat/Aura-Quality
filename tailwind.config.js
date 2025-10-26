/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aqi-good': '#00e400',
        'aqi-moderate': '#ffff00',
        'aqi-usg': '#ff7e00',
        'aqi-unhealthy': '#ff0000',
        'aqi-very-unhealthy': '#8f3f97',
        'aqi-hazardous': '#7e0023',
      }
    },
  },
  plugins: [],
}
