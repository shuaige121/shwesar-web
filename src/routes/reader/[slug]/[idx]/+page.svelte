<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		getNovel,
		getChapter,
		listChapters,
		getProgress,
		addBookmark,
		type Novel,
		type Chapter
	} from '$lib/offline-cache';
	import {
		startProgressTracker,
		restoreScroll,
		readerSettings,
		fontSizePx,
		themeBackground,
		themeForeground,
		type FontSize,
		type ReaderTheme,
		splitMyanmarSentences
	} from '$lib/reader-engine';

	let novel = $state<Novel | null>(null);
	let chapter = $state<Chapter | null>(null);
	let chapterCount = $state(0);
	let loading = $state(true);
	let notFound = $state(false);
	let bookmarkSaved = $state(false);
	let detach: (() => void) | null = null;

	const slug = $derived($page.params.slug ?? '');
	const idx = $derived(Number($page.params.idx ?? '0'));

	const sizes: FontSize[] = ['S', 'M', 'L', 'XL'];
	const themes: ReaderTheme[] = ['light', 'sepia', 'dark'];

	$effect(() => {
		loading = true;
		notFound = false;
		bookmarkSaved = false;
		detach?.();
		detach = null;
		(async () => {
			if (!slug) {
				notFound = true;
				loading = false;
				return;
			}
			const n = await getNovel(slug);
			if (!n?.id) {
				notFound = true;
				loading = false;
				return;
			}
			novel = n;
			const all = await listChapters(n.id);
			chapterCount = all.length;
			const c = await getChapter(n.id, idx);
			if (!c) {
				notFound = true;
				loading = false;
				return;
			}
			chapter = c;
			loading = false;
			// give DOM a tick to lay out before scroll restore + tracker attach
			setTimeout(async () => {
				const p = await getProgress(n.id!);
				if (p && p.chapter_idx === idx) restoreScroll(p.scroll_pct);
				detach = startProgressTracker({ novelId: n.id!, chapterIdx: idx });
			}, 50);
		})();
	});

	onDestroy(() => {
		detach?.();
	});

	const sentences = $derived(chapter ? splitMyanmarSentences(chapter.body_my) : []);

	const setSize = (s: FontSize) => readerSettings.update((v) => ({ ...v, fontSize: s }));
	const setTheme = (t: ReaderTheme) => readerSettings.update((v) => ({ ...v, theme: t }));

	const onBookmark = async () => {
		if (!novel?.id) return;
		const pct =
			document.documentElement.scrollHeight - window.innerHeight > 0
				? window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
				: 1;
		await addBookmark(novel.id, idx, pct);
		bookmarkSaved = true;
		setTimeout(() => (bookmarkSaved = false), 1500);
	};

	const goPrev = () => {
		if (idx > 0 && novel) goto(`/reader/${novel.slug}/${idx - 1}`);
	};
	const goNext = () => {
		if (idx < chapterCount - 1 && novel) goto(`/reader/${novel.slug}/${idx + 1}`);
	};
</script>

<svelte:head>
	<title>{chapter?.title ?? 'Chapter'} — {novel?.title_my ?? 'Reader'} — ShweSar</title>
</svelte:head>

<div
	class="min-h-screen"
	style="background:{themeBackground[$readerSettings.theme]};color:{themeForeground[
		$readerSettings.theme
	]};"
>
	<div
		class="sticky top-12 z-10 border-b border-slate-200/40 px-3 py-2 backdrop-blur"
		style="background:{themeBackground[$readerSettings.theme]}cc;"
	>
		<div class="mx-auto flex max-w-3xl flex-wrap items-center gap-2 text-sm">
			<a
				class="rounded px-2 py-1 hover:bg-black/5"
				href={novel ? `/reader/${novel.slug}` : '/reader'}
			>
				← Chapters
			</a>
			<div class="ml-auto flex items-center gap-1">
				<span class="text-xs opacity-70">A</span>
				{#each sizes as s (s)}
					<button
						type="button"
						onclick={() => setSize(s)}
						aria-pressed={$readerSettings.fontSize === s}
						class="rounded px-2 py-1 text-xs hover:bg-black/5 {$readerSettings.fontSize === s
							? 'font-bold underline'
							: ''}"
					>
						{s}
					</button>
				{/each}
				<span class="mx-2 opacity-30">|</span>
				{#each themes as t (t)}
					<button
						type="button"
						onclick={() => setTheme(t)}
						aria-pressed={$readerSettings.theme === t}
						class="rounded px-2 py-1 text-xs hover:bg-black/5 {$readerSettings.theme === t
							? 'font-bold underline'
							: ''}"
					>
						{t}
					</button>
				{/each}
				<button
					type="button"
					onclick={onBookmark}
					class="ml-2 rounded bg-brand-leaf px-2 py-1 text-xs font-bold text-white"
					aria-label="Add bookmark"
				>
					{bookmarkSaved ? 'Saved' : 'Bookmark'}
				</button>
			</div>
		</div>
	</div>

	<article class="mx-auto max-w-3xl px-4 py-6">
		{#if loading}
			<p class="text-sm opacity-70">Loading…</p>
		{:else if notFound}
			<div class="rounded-lg border border-dashed border-current/30 p-6 text-sm">
				<p class="font-bold">Chapter not found</p>
				<a class="text-brand-leaf underline" href="/reader">Back to library</a>
			</div>
		{:else if chapter}
			<header class="mb-4">
				<p class="text-xs opacity-70">Ch.{chapter.idx + 1} of {chapterCount}</p>
				<h1 class="text-2xl font-bold">{chapter.title}</h1>
			</header>

			<div
				class="space-y-4 leading-loose"
				style="font-size:{fontSizePx[$readerSettings.fontSize]}px;line-height:1.85;"
			>
				{#each sentences as sent, i (i)}
					<p>{sent}</p>
				{/each}
			</div>

			<nav class="mt-10 flex justify-between text-sm" aria-label="Chapter navigation">
				<button
					type="button"
					onclick={goPrev}
					disabled={idx === 0}
					class="rounded border border-current/30 px-3 py-2 disabled:opacity-30"
				>
					← Previous
				</button>
				<button
					type="button"
					onclick={goNext}
					disabled={idx >= chapterCount - 1}
					class="rounded border border-current/30 px-3 py-2 disabled:opacity-30"
				>
					Next →
				</button>
			</nav>
		{/if}
	</article>
</div>
