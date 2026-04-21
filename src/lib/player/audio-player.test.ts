import { describe, expect, it, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { get } from 'svelte/store';
import {
	ShwesarDB,
	setDbForTesting,
	upsertAudioItem,
	upsertAudioChapters,
	saveAudioProgress,
	getAudioProgress
} from '../offline-cache/db';
import { formatDuration, playerStore, stop } from './audio-player';

describe('formatDuration', () => {
	it('formats seconds as m:ss', () => {
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(5)).toBe('0:05');
		expect(formatDuration(65)).toBe('1:05');
		expect(formatDuration(3725)).toBe('62:05');
	});

	it('clamps invalid input to 0:00', () => {
		expect(formatDuration(NaN)).toBe('0:00');
		expect(formatDuration(-1)).toBe('0:00');
	});
});

describe('playerStore + Dexie', () => {
	beforeEach(async () => {
		const name = `shwesar-test-${Math.random().toString(36).slice(2)}`;
		const db = new ShwesarDB(name);
		setDbForTesting(db);
		await db.open();
		stop();
	});

	it('starts in idle state with no item', () => {
		const snap = get(playerStore);
		expect(snap.state).toBe('idle');
		expect(snap.itemId).toBeNull();
	});

	it('persists audio progress and reads it back', async () => {
		const id = await upsertAudioItem({
			slug: 'a',
			kind: 'audiobook',
			title_my: 'က',
			title_en: 'A',
			author: '',
			language: 'my',
			cover_url: null,
			description: '',
			source: 'demo',
			license: 'demo'
		});
		await upsertAudioChapters(id, [{ idx: 0, title: 'one', url: '/x.mp3', duration_s: 10 }]);
		await saveAudioProgress(id, 0, 4.5);
		const p = await getAudioProgress(id);
		expect(p?.position_s).toBe(4.5);
	});
});
