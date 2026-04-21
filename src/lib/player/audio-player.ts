import { Howl } from 'howler';
import { writable, get, type Writable } from 'svelte/store';
import {
	getAudioChapter,
	getAudioProgress,
	listAudioChapters,
	saveAudioProgress,
	type AudioChapter,
	type AudioItem
} from '../offline-cache/db';
import type { PlayerState } from './index';

export interface PlayerSnapshot {
	state: PlayerState;
	itemId: number | null;
	itemSlug: string | null;
	itemTitle: string | null;
	chapterIdx: number;
	chapterTitle: string | null;
	chapterCount: number;
	position_s: number;
	duration_s: number;
	error: string | null;
}

const empty: PlayerSnapshot = {
	state: 'idle',
	itemId: null,
	itemSlug: null,
	itemTitle: null,
	chapterIdx: 0,
	chapterTitle: null,
	chapterCount: 0,
	position_s: 0,
	duration_s: 0,
	error: null
};

export const playerStore: Writable<PlayerSnapshot> = writable({ ...empty });

let howl: Howl | null = null;
let chapters: AudioChapter[] = [];
let activeItem: AudioItem | null = null;
let tickHandle: ReturnType<typeof setInterval> | null = null;
let lastSavedPosition = -1;

const stopTick = () => {
	if (tickHandle) {
		clearInterval(tickHandle);
		tickHandle = null;
	}
};

const startTick = () => {
	stopTick();
	tickHandle = setInterval(() => {
		if (!howl) return;
		const seek = typeof howl.seek === 'function' ? Number(howl.seek()) : 0;
		const snap = get(playerStore);
		playerStore.set({ ...snap, position_s: seek });
		if (snap.itemId !== null && Math.abs(seek - lastSavedPosition) > 1) {
			lastSavedPosition = seek;
			void saveAudioProgress(snap.itemId, snap.chapterIdx, seek);
		}
	}, 1000);
};

const teardownHowl = () => {
	if (howl) {
		howl.off();
		howl.unload();
		howl = null;
	}
	stopTick();
};

const updateMediaSession = (item: AudioItem | null, chapter: AudioChapter | null) => {
	if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
	if (!item || !chapter) {
		navigator.mediaSession.metadata = null;
		navigator.mediaSession.playbackState = 'none';
		return;
	}
	navigator.mediaSession.metadata = new MediaMetadata({
		title: chapter.title,
		artist: item.title_my,
		album: item.title_en,
		artwork: item.cover_url ? [{ src: item.cover_url, sizes: '512x512', type: 'image/png' }] : []
	});
	navigator.mediaSession.setActionHandler('play', () => resume());
	navigator.mediaSession.setActionHandler('pause', () => pause());
	navigator.mediaSession.setActionHandler('previoustrack', () => skipChapter(-1));
	navigator.mediaSession.setActionHandler('nexttrack', () => skipChapter(1));
	navigator.mediaSession.setActionHandler('seekbackward', (e) => seekBy(-(e.seekOffset ?? 15)));
	navigator.mediaSession.setActionHandler('seekforward', (e) => seekBy(e.seekOffset ?? 15));
};

export const playChapter = async (
	item: AudioItem,
	chapterIdx: number,
	resumeFromSavedPosition = false
): Promise<void> => {
	if (!item.id) return;
	if (chapters.length === 0 || activeItem?.id !== item.id) {
		chapters = await listAudioChapters(item.id);
	}
	const chapter = await getAudioChapter(item.id, chapterIdx);
	if (!chapter) {
		playerStore.set({
			...get(playerStore),
			state: 'error',
			error: `Chapter ${chapterIdx} not found`
		});
		return;
	}

	teardownHowl();
	activeItem = item;
	playerStore.set({
		...empty,
		state: 'loading',
		itemId: item.id,
		itemSlug: item.slug,
		itemTitle: item.title_my,
		chapterIdx,
		chapterTitle: chapter.title,
		chapterCount: chapters.length,
		duration_s: chapter.duration_s
	});

	const startAt = resumeFromSavedPosition
		? ((await getAudioProgress(item.id))?.position_s ?? 0)
		: 0;

	howl = new Howl({
		src: [chapter.url],
		html5: true,
		preload: true,
		onload: () => {
			if (!howl) return;
			const dur = howl.duration() || chapter.duration_s;
			const snap = get(playerStore);
			playerStore.set({ ...snap, duration_s: dur });
			if (startAt > 0 && startAt < dur) howl.seek(startAt);
		},
		onplay: () => {
			startTick();
			playerStore.set({ ...get(playerStore), state: 'playing', error: null });
			if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
				navigator.mediaSession.playbackState = 'playing';
			}
		},
		onpause: () => {
			stopTick();
			playerStore.set({ ...get(playerStore), state: 'paused' });
			if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
				navigator.mediaSession.playbackState = 'paused';
			}
		},
		onend: () => {
			stopTick();
			playerStore.set({ ...get(playerStore), state: 'ended' });
			if (item.id) void saveAudioProgress(item.id, chapterIdx, 0);
			void skipChapter(1);
		},
		onloaderror: (_id, err) => {
			playerStore.set({
				...get(playerStore),
				state: 'error',
				error: typeof err === 'string' ? err : 'Failed to load audio'
			});
		},
		onplayerror: (_id, err) => {
			playerStore.set({
				...get(playerStore),
				state: 'error',
				error: typeof err === 'string' ? err : 'Failed to play audio'
			});
		}
	});

	updateMediaSession(item, chapter);
	howl.play();
};

export const resume = (): void => {
	if (howl && !howl.playing()) howl.play();
};

export const pause = (): void => {
	if (howl?.playing()) howl.pause();
};

export const togglePlay = (): void => {
	if (!howl) return;
	if (howl.playing()) howl.pause();
	else howl.play();
};

export const seekTo = (seconds: number): void => {
	if (!howl) return;
	howl.seek(Math.max(0, seconds));
	const snap = get(playerStore);
	playerStore.set({ ...snap, position_s: Math.max(0, seconds) });
};

export const seekBy = (delta: number): void => {
	if (!howl) return;
	const cur = Number(howl.seek()) || 0;
	seekTo(cur + delta);
};

export const skipChapter = async (delta: number): Promise<void> => {
	if (!activeItem || !activeItem.id) return;
	const snap = get(playerStore);
	const next = snap.chapterIdx + delta;
	if (next < 0 || next >= chapters.length) {
		stop();
		return;
	}
	await playChapter(activeItem, next, false);
};

export const stop = (): void => {
	teardownHowl();
	activeItem = null;
	chapters = [];
	lastSavedPosition = -1;
	playerStore.set({ ...empty });
	if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
		navigator.mediaSession.metadata = null;
		navigator.mediaSession.playbackState = 'none';
	}
};

export const formatDuration = (seconds: number): string => {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const total = Math.floor(seconds);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
};
