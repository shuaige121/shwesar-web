<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { listNovels, recentProgress, type Novel } from '$lib/offline-cache';

	let novels = $state<Novel[]>([]);
	let progressMap = $state(new SvelteMap<number, number>());
	let loading = $state(true);

	onMount(async () => {
		try {
			novels = await listNovels();
			const recent = await recentProgress(50);
			const m = new SvelteMap<number, number>();
			for (const p of recent) m.set(p.novel_id, p.chapter_idx);
			progressMap = m;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Reader — ShweSar</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-6">
	<div class="mb-6">
		<p class="text-sm font-bold text-brand-leaf">ဖတ်စာ · Reader</p>
		<h1 class="text-3xl font-bold">Library</h1>
		<p class="text-sm text-slate-600">
			Offline-first. Tap a book to read. Bookmarks and progress are saved on this device.
		</p>
	</div>

	{#if loading}
		<p class="text-sm text-slate-500">Loading…</p>
	{:else if novels.length === 0}
		<div class="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
			Library is empty. Reload the page to fetch the seed library.
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each novels as novel (novel.slug)}
				<li>
					<a
						href={`/reader/${novel.slug}`}
						class="flex h-full gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-leaf hover:shadow-sm"
					>
						{#if novel.cover_url}
							<img
								src={novel.cover_url}
								alt=""
								class="h-20 w-16 flex-none rounded object-cover"
								loading="lazy"
							/>
						{:else}
							<div
								class="flex h-20 w-16 flex-none items-center justify-center rounded bg-slate-100 text-xs text-slate-400"
								aria-hidden="true"
							>
								ရွှေစာ
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<p class="truncate font-bold">{novel.title_my}</p>
							<p class="truncate text-xs text-slate-500">{novel.title_en}</p>
							<p class="mt-1 text-xs text-slate-500">{novel.source}</p>
							{#if novel.id !== undefined && progressMap.has(novel.id)}
								<p class="mt-1 text-xs text-brand-leaf">
									Continue · ch.{(progressMap.get(novel.id) ?? 0) + 1}
								</p>
							{/if}
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
