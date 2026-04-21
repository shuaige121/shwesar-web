import Dexie, { type Table } from 'dexie';

export type ContentSource = 'udhr' | 'demo' | 'folktale' | 'user';
export type ContentLicense = 'public-domain' | 'cc0' | 'cc-by' | 'demo' | 'unknown';

export interface Novel {
	id?: number;
	slug: string;
	title_my: string;
	title_en: string;
	author: string;
	language: string;
	cover_url: string | null;
	description: string;
	source: ContentSource;
	license: ContentLicense;
	created_at: number;
}

export interface Chapter {
	id?: number;
	novel_id: number;
	idx: number;
	title: string;
	body_my: string;
	char_count: number;
}

export interface Progress {
	novel_id: number;
	chapter_idx: number;
	scroll_pct: number;
	updated_at: number;
}

export interface Bookmark {
	id?: number;
	novel_id: number;
	chapter_idx: number;
	scroll_pct: number;
	note: string;
	created_at: number;
}

export class ShwesarDB extends Dexie {
	novels!: Table<Novel, number>;
	chapters!: Table<Chapter, number>;
	progress!: Table<Progress, number>;
	bookmarks!: Table<Bookmark, number>;

	constructor(name = 'shwesar') {
		super(name);
		this.version(1).stores({
			novels: '++id, &slug, source, created_at',
			chapters: '++id, &[novel_id+idx], novel_id',
			progress: 'novel_id, updated_at',
			bookmarks: '++id, novel_id, [novel_id+chapter_idx], created_at'
		});
	}
}

let cachedDb: ShwesarDB | null = null;

export const getDb = (): ShwesarDB => {
	if (!cachedDb) cachedDb = new ShwesarDB();
	return cachedDb;
};

export const setDbForTesting = (db: ShwesarDB | null): void => {
	cachedDb = db;
};

export const listNovels = async (): Promise<Novel[]> => {
	return getDb().novels.orderBy('created_at').reverse().toArray();
};

export const getNovel = async (slug: string): Promise<Novel | undefined> => {
	return getDb().novels.where('slug').equals(slug).first();
};

export const listChapters = async (novelId: number): Promise<Chapter[]> => {
	return getDb().chapters.where('novel_id').equals(novelId).sortBy('idx');
};

export const getChapter = async (novelId: number, idx: number): Promise<Chapter | undefined> => {
	return getDb().chapters.where('[novel_id+idx]').equals([novelId, idx]).first();
};

export const saveProgress = async (
	novelId: number,
	chapterIdx: number,
	scrollPct: number
): Promise<void> => {
	await getDb().progress.put({
		novel_id: novelId,
		chapter_idx: chapterIdx,
		scroll_pct: scrollPct,
		updated_at: Date.now()
	});
};

export const getProgress = async (novelId: number): Promise<Progress | undefined> => {
	return getDb().progress.get(novelId);
};

export const recentProgress = async (limit = 12): Promise<Progress[]> => {
	return getDb().progress.orderBy('updated_at').reverse().limit(limit).toArray();
};

export const addBookmark = async (
	novelId: number,
	chapterIdx: number,
	scrollPct: number,
	note = ''
): Promise<number> => {
	return getDb().bookmarks.add({
		novel_id: novelId,
		chapter_idx: chapterIdx,
		scroll_pct: scrollPct,
		note,
		created_at: Date.now()
	});
};

export const listBookmarks = async (novelId?: number): Promise<Bookmark[]> => {
	const table = getDb().bookmarks;
	if (novelId === undefined) return table.orderBy('created_at').reverse().toArray();
	return table.where('novel_id').equals(novelId).reverse().sortBy('created_at');
};

export const removeBookmark = async (id: number): Promise<void> => {
	await getDb().bookmarks.delete(id);
};

export const upsertNovel = async (
	novel: Omit<Novel, 'id' | 'created_at'> & { created_at?: number }
): Promise<number> => {
	const existing = await getNovel(novel.slug);
	const created_at = novel.created_at ?? Date.now();
	if (existing?.id) {
		await getDb().novels.update(existing.id, { ...novel, created_at });
		return existing.id;
	}
	return getDb().novels.add({ ...novel, created_at });
};

export const upsertChapters = async (
	novelId: number,
	chapters: Omit<Chapter, 'id' | 'novel_id' | 'char_count'>[]
): Promise<void> => {
	const rows: Chapter[] = chapters.map((c) => ({
		novel_id: novelId,
		idx: c.idx,
		title: c.title,
		body_my: c.body_my,
		char_count: c.body_my.length
	}));
	await getDb().chapters.bulkPut(rows);
};

export const isSeeded = async (): Promise<boolean> => {
	return (await getDb().novels.count()) > 0;
};
