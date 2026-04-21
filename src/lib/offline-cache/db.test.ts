import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import {
	ShwesarDB,
	setDbForTesting,
	getNovel,
	listNovels,
	upsertNovel,
	upsertChapters,
	listChapters,
	getChapter,
	saveProgress,
	getProgress,
	recentProgress,
	addBookmark,
	listBookmarks,
	removeBookmark,
	isSeeded
} from './db';

let db: ShwesarDB;

beforeEach(async () => {
	const name = `shwesar-test-${Math.random().toString(36).slice(2)}`;
	db = new ShwesarDB(name);
	setDbForTesting(db);
	await db.open();
});

describe('novels + chapters', () => {
	it('starts empty and reports not seeded', async () => {
		expect(await isSeeded()).toBe(false);
		expect(await listNovels()).toEqual([]);
	});

	it('upserts a novel and re-reads by slug', async () => {
		const id = await upsertNovel({
			slug: 'welcome',
			title_my: 'က',
			title_en: 'Welcome',
			author: 'a',
			language: 'my',
			cover_url: null,
			description: 'd',
			source: 'demo',
			license: 'demo'
		});
		expect(id).toBeGreaterThan(0);
		const fetched = await getNovel('welcome');
		expect(fetched?.title_en).toBe('Welcome');
		expect(await isSeeded()).toBe(true);
	});

	it('upsert is idempotent on slug', async () => {
		await upsertNovel({
			slug: 'welcome',
			title_my: 'က',
			title_en: 'v1',
			author: 'a',
			language: 'my',
			cover_url: null,
			description: '',
			source: 'demo',
			license: 'demo'
		});
		await upsertNovel({
			slug: 'welcome',
			title_my: 'က',
			title_en: 'v2',
			author: 'a',
			language: 'my',
			cover_url: null,
			description: '',
			source: 'demo',
			license: 'demo'
		});
		expect(await listNovels()).toHaveLength(1);
		expect((await getNovel('welcome'))?.title_en).toBe('v2');
	});

	it('stores chapters and reads them back ordered by idx', async () => {
		const id = await upsertNovel({
			slug: 'x',
			title_my: 'က',
			title_en: 'X',
			author: 'a',
			language: 'my',
			cover_url: null,
			description: '',
			source: 'demo',
			license: 'demo'
		});
		await upsertChapters(id, [
			{ idx: 1, title: 'two', body_my: 'kk။' },
			{ idx: 0, title: 'one', body_my: 'aa။' }
		]);
		const chapters = await listChapters(id);
		expect(chapters.map((c) => c.idx)).toEqual([0, 1]);
		const ch1 = await getChapter(id, 1);
		expect(ch1?.title).toBe('two');
		expect(ch1?.char_count).toBe('kk။'.length);
	});
});

describe('progress + bookmarks', () => {
	it('saves and retrieves progress per novel', async () => {
		await saveProgress(1, 2, 0.5);
		const p = await getProgress(1);
		expect(p?.chapter_idx).toBe(2);
		expect(p?.scroll_pct).toBe(0.5);
	});

	it('recentProgress returns most recent first', async () => {
		await saveProgress(1, 0, 0.1);
		await new Promise((r) => setTimeout(r, 5));
		await saveProgress(2, 0, 0.2);
		const r = await recentProgress(10);
		expect(r[0]?.novel_id).toBe(2);
	});

	it('adds, lists, and removes bookmarks', async () => {
		const id = await addBookmark(7, 1, 0.3, 'note');
		const list = await listBookmarks(7);
		expect(list).toHaveLength(1);
		expect(list[0]?.note).toBe('note');
		await removeBookmark(id);
		expect(await listBookmarks(7)).toHaveLength(0);
	});

	it('listBookmarks without novelId returns all sorted by created_at desc', async () => {
		await addBookmark(1, 0, 0);
		await new Promise((r) => setTimeout(r, 5));
		await addBookmark(2, 0, 0);
		const list = await listBookmarks();
		expect(list[0]?.novel_id).toBe(2);
	});
});
