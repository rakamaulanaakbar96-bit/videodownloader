import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0f172a", // Slate 900 (Deep Blue/Black)
                    foreground: "#f8fafc", // Slate 50
                },
                secondary: {
                    DEFAULT: "#334155", // Slate 700
                    foreground: "#f8fafc",
                },
                accent: {
                    DEFAULT: "#0ea5e9", // Sky 500 (Vibrant Blue)
                    foreground: "#f8fafc",
                },
                background: "#ffffff",
                foreground: "#020617",
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
