import {
	isSeeded,
	isAudioSeeded,
	upsertNovel,
	upsertChapters,
	upsertAudioItem,
	upsertAudioChapters,
	type AudioKind,
	type ContentLicense,
	type ContentSource
} from './db';

interface SeedChapter {
	idx: number;
	title: string;
	body_my: string;
}

interface SeedNovel {
	slug: string;
	title_my: string;
	title_en: string;
	author: string;
	language: string;
	source: ContentSource;
	license: ContentLicense;
	cover_url?: string | null;
	description?: string;
	chapters: SeedChapter[];
}

interface SeedIndex {
	version: number;
	novels: { slug: string; cover?: string }[];
}

interface SeedAudioChapter {
	idx: number;
	title: string;
	url: string;
	duration_s: number;
}

interface SeedAudioItem {
	slug: string;
	kind: AudioKind;
	title_my: string;
	title_en: string;
	author: string;
	language: string;
	source: ContentSource;
	license: ContentLicense;
	cover_url?: string | null;
	description?: string;
	chapters: SeedAudioChapter[];
}

interface AudioSeedIndex {
	version: number;
	items: { slug: string; kind: AudioKind }[];
}

export const seedFromStatic = async (
	fetcher: typeof fetch = fetch,
	indexUrl = '/seed/index.json'
): Promise<{ inserted: number; skipped: boolean }> => {
	if (await isSeeded()) return { inserted: 0, skipped: true };

	const idxRes = await fetcher(indexUrl);
	if (!idxRes.ok) throw new Error(`seed index fetch failed: ${idxRes.status}`);
	const index = (await idxRes.json()) as SeedIndex;

	let inserted = 0;
	for (const entry of index.novels) {
		const url = `/seed/novels/${entry.slug}.json`;
		const res = await fetcher(url);
		if (!res.ok) continue;
		const novel = (await res.json()) as SeedNovel;
		const novelId = await upsertNovel({
			slug: novel.slug,
			title_my: novel.title_my,
			title_en: novel.title_en,
			author: novel.author,
			language: novel.language,
			cover_url: novel.cover_url ?? entry.cover ?? null,
			description: novel.description ?? '',
			source: novel.source,
			license: novel.license
		});
		await upsertChapters(novelId, novel.chapters);
		inserted += 1;
	}
	return { inserted, skipped: false };
};

export const seedAudioFromStatic = async (
	fetcher: typeof fetch = fetch,
	indexUrl = '/seed/audio-index.json'
): Promise<{ inserted: number; skipped: boolean }> => {
	if (await isAudioSeeded()) return { inserted: 0, skipped: true };

	const idxRes = await fetcher(indexUrl);
	if (!idxRes.ok) throw new Error(`audio seed index fetch failed: ${idxRes.status}`);
	const index = (await idxRes.json()) as AudioSeedIndex;

	let inserted = 0;
	for (const entry of index.items) {
		const url = `/seed/audio/${entry.slug}.json`;
		const res = await fetcher(url);
		if (!res.ok) continue;
		const item = (await res.json()) as SeedAudioItem;
		const itemId = await upsertAudioItem({
			slug: item.slug,
			kind: item.kind,
			title_my: item.title_my,
			title_en: item.title_en,
			author: item.author,
			language: item.language,
			cover_url: item.cover_url ?? null,
			description: item.description ?? '',
			source: item.source,
			license: item.license
		});
		await upsertAudioChapters(itemId, item.chapters);
		inserted += 1;
	}
	return { inserted, skipped: false };
};
