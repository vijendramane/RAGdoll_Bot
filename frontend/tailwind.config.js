/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./app/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#0f172a',
					accent: '#2563eb'
				}
			}
		}
	},
	plugins: []
};

