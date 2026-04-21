import {
	isSeeded,
	upsertNovel,
	upsertChapters,
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
