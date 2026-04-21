import { writable, type Writable } from 'svelte/store';

export type FontSize = 'S' | 'M' | 'L' | 'XL';
export type ReaderTheme = 'light' | 'sepia' | 'dark';

export const fontSizePx: Record<FontSize, number> = { S: 16, M: 19, L: 22, XL: 26 };

const STORAGE_KEY = 'shwesar:reader-settings';

export interface ReaderSettings {
	fontSize: FontSize;
	theme: ReaderTheme;
}

const DEFAULTS: ReaderSettings = { fontSize: 'M', theme: 'light' };

const isBrowser = (): boolean =>
	typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const readFromStorage = (): ReaderSettings => {
	if (!isBrowser()) return DEFAULTS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
		const fontSize: FontSize =
			parsed.fontSize && (['S', 'M', 'L', 'XL'] as FontSize[]).includes(parsed.fontSize)
				? parsed.fontSize
				: DEFAULTS.fontSize;
		const theme: ReaderTheme =
			parsed.theme && (['light', 'sepia', 'dark'] as ReaderTheme[]).includes(parsed.theme)
				? parsed.theme
				: DEFAULTS.theme;
		return { fontSize, theme };
	} catch {
		return DEFAULTS;
	}
};

export const readerSettings: Writable<ReaderSettings> = writable(readFromStorage());

if (isBrowser()) {
	readerSettings.subscribe((value) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		} catch {
			// ignore quota / private-mode errors
		}
	});
}

export const themeBackground: Record<ReaderTheme, string> = {
	light: '#f8fafc',
	sepia: '#f4ecd8',
	dark: '#111418'
};

export const themeForeground: Record<ReaderTheme, string> = {
	light: '#17201d',
	sepia: '#3a2a14',
	dark: '#e7eaec'
};
