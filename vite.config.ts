import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			scope: '/',
			includeAssets: [
				'brand/shwesar_logo.png',
				'brand/shwesar_banner.png',
				'fonts/Padauk-Regular.ttf'
			],
			manifest: {
				name: 'ရွှေစာ ShweSar',
				short_name: 'ရွှေစာ',
				description: 'Myanmar offline reader, audiobooks, and audio courses.',
				lang: 'my',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#f8fafc',
				theme_color: '#0f766e',
				categories: ['books', 'education', 'entertainment'],
				icons: [
					{
						src: '/brand/shwesar_logo.png',
						sizes: '1024x1024',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				navigateFallback: '/',
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,ttf,webmanifest,xml,txt}']
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
