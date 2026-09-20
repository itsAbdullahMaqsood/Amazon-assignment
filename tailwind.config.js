/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                amazon: {
                    blue_light: "#232f3e",
                    blue_dark: "#131921",
                    orange: "#febd69",
                },
            },
        },
    },
    plugins: [require("tailwind-scrollbar-hide")],
};
