<script lang="ts">
	import { page } from '$app/stores';
	import {
		getNovel,
		listChapters,
		getProgress,
		type Novel,
		type Chapter
	} from '$lib/offline-cache';

	let novel = $state<Novel | null>(null);
	let chapters = $state<Chapter[]>([]);
	let resumeIdx = $state<number | null>(null);
	let loading = $state(true);
	let notFound = $state(false);

	const slug = $derived($page.params.slug ?? '');

	$effect(() => {
		loading = true;
		notFound = false;
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
			chapters = await listChapters(n.id);
			const p = await getProgress(n.id);
			resumeIdx = p ? p.chapter_idx : null;
			loading = false;
		})();
	});
</script>

<svelte:head>
	<title>{novel?.title_my ?? 'Reader'} — ShweSar</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-6">
	{#if loading}
		<p class="text-sm text-slate-500">Loading…</p>
	{:else if notFound}
		<div class="rounded-lg border border-dashed border-slate-300 p-6 text-sm">
			<p class="font-bold">Not in your library</p>
			<p class="mt-1 text-slate-600">
				This title isn't seeded on this device.
				<a class="text-brand-leaf underline" href="/reader">Back to library</a>.
			</p>
		</div>
	{:else if novel}
		<a class="text-xs text-brand-leaf" href="/reader">← Library</a>
		<h1 class="mt-2 text-3xl font-bold leading-tight">{novel.title_my}</h1>
		<p class="text-sm text-slate-500">{novel.title_en} · {novel.author}</p>
		<p class="mt-1 text-xs text-slate-500">
			{novel.source} · {novel.license}
		</p>
		{#if novel.description}
			<p class="mt-4 text-sm leading-7 text-slate-700">{novel.description}</p>
		{/if}

		<div class="mt-6 flex flex-wrap gap-3">
			{#if resumeIdx !== null && novel.id !== undefined}
				<a
					href={`/reader/${novel.slug}/${resumeIdx}`}
					class="rounded-lg bg-brand-leaf px-4 py-2 font-bold text-white"
				>
					Continue · ch.{resumeIdx + 1}
				</a>
			{:else if chapters.length > 0}
				<a
					href={`/reader/${novel.slug}/0`}
					class="rounded-lg bg-brand-leaf px-4 py-2 font-bold text-white"
				>
					Start reading
				</a>
			{/if}
		</div>

		<ol class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
			{#each chapters as ch (ch.idx)}
				<li>
					<a
						href={`/reader/${novel.slug}/${ch.idx}`}
						class="flex items-center justify-between gap-3 p-3 hover:bg-slate-50"
					>
						<span>
							<span class="text-xs text-slate-400">Ch.{ch.idx + 1}</span>
							<span class="ml-2 font-bold">{ch.title}</span>
						</span>
						<span class="text-xs text-slate-400">{ch.char_count} chars</span>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</section>
