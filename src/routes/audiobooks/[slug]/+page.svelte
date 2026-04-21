<script lang="ts">
	import { page } from '$app/stores';
	import {
		getAudioItem,
		listAudioChapters,
		getAudioProgress,
		type AudioItem,
		type AudioChapter
	} from '$lib/offline-cache';
	import { playChapter, formatDuration } from '$lib/player';

	let item = $state<AudioItem | null>(null);
	let chapters = $state<AudioChapter[]>([]);
	let resumeIdx = $state<number | null>(null);
	let resumePos = $state<number>(0);
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
			const it = await getAudioItem(slug);
			if (!it?.id) {
				notFound = true;
				loading = false;
				return;
			}
			item = it;
			chapters = await listAudioChapters(it.id);
			const p = await getAudioProgress(it.id);
			if (p) {
				resumeIdx = p.chapter_idx;
				resumePos = p.position_s;
			} else {
				resumeIdx = null;
				resumePos = 0;
			}
			loading = false;
		})();
	});

	const onPlay = (idx: number, resume = false) => {
		if (!item) return;
		void playChapter(item, idx, resume);
	};
</script>

<svelte:head>
	<title>{item?.title_my ?? 'Audio'} — ShweSar</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-6">
	{#if loading}
		<p class="text-sm text-slate-500">Loading…</p>
	{:else if notFound}
		<div class="rounded-lg border border-dashed border-slate-300 p-6 text-sm">
			<p class="font-bold">Not in your library</p>
			<a class="text-brand-leaf underline" href="/audiobooks">Back to audiobooks</a>
		</div>
	{:else if item}
		<a class="text-xs text-brand-leaf" href={item.kind === 'course' ? '/courses' : '/audiobooks'}>
			← {item.kind === 'course' ? 'Courses' : 'Audiobooks'}
		</a>
		<h1 class="mt-2 text-3xl font-bold leading-tight">{item.title_my}</h1>
		<p class="text-sm text-slate-500">{item.title_en} · {item.author}</p>
		<p class="mt-1 text-xs text-slate-500">{item.source} · {item.license}</p>
		{#if item.description}
			<p class="mt-4 text-sm leading-7 text-slate-700">{item.description}</p>
		{/if}

		<div class="mt-6 flex flex-wrap gap-3">
			{#if resumeIdx !== null}
				<button
					type="button"
					onclick={() => onPlay(resumeIdx ?? 0, true)}
					class="rounded-lg bg-brand-leaf px-4 py-2 font-bold text-white"
				>
					Resume · ch.{(resumeIdx ?? 0) + 1} @ {formatDuration(resumePos)}
				</button>
			{:else if chapters.length > 0}
				<button
					type="button"
					onclick={() => onPlay(0, false)}
					class="rounded-lg bg-brand-leaf px-4 py-2 font-bold text-white"
				>
					Start listening
				</button>
			{/if}
		</div>

		<ol class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
			{#each chapters as ch (ch.idx)}
				<li>
					<button
						type="button"
						onclick={() => onPlay(ch.idx, false)}
						class="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-slate-50"
					>
						<span>
							<span class="text-xs text-slate-400">Ch.{ch.idx + 1}</span>
							<span class="ml-2 font-bold">{ch.title}</span>
						</span>
						<span class="text-xs text-slate-400">{formatDuration(ch.duration_s)}</span>
					</button>
				</li>
			{/each}
		</ol>
	{/if}
</section>
