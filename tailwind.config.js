/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Padauk', 'system-ui', 'sans-serif'],
				myanmar: ['Padauk', 'system-ui', 'sans-serif']
			},
			colors: {
				brand: {
					ink: '#17201d',
					leaf: '#0f766e',
					gold: '#b8860b',
					paper: '#f8fafc'
				}
			}
		}
	},
	plugins: []
};
