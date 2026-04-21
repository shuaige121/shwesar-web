<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listBookmarks,
		listNovels,
		recentProgress,
		removeBookmark,
		type Bookmark,
		type Novel,
		type Progress
	} from '$lib/offline-cache';

	let novels = $state<Novel[]>([]);
	let bookmarks = $state<Bookmark[]>([]);
	let recent = $state<Progress[]>([]);
	let loading = $state(true);

	const refresh = async () => {
		novels = await listNovels();
		bookmarks = await listBookmarks();
		recent = await recentProgress(10);
		loading = false;
	};

	onMount(refresh);

	const novelById = $derived(new Map(novels.map((n) => [n.id ?? -1, n])));

	const onRemove = async (id?: number) => {
		if (id === undefined) return;
		await removeBookmark(id);
		await refresh();
	};

	const fmtDate = (ts: number) => new Date(ts).toLocaleString();
</script>

<svelte:head>
	<title>Library — ShweSar</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-6">
	<p class="text-sm font-bold text-brand-leaf">စာကြည့်တိုက် · Library</p>
	<h1 class="text-3xl font-bold">Bookmarks & recent</h1>

	{#if loading}
		<p class="mt-4 text-sm text-slate-500">Loading…</p>
	{:else}
		<section class="mt-6">
			<h2 class="mb-2 text-lg font-bold">Recently read</h2>
			{#if recent.length === 0}
				<p class="text-sm text-slate-500">No reading history yet.</p>
			{:else}
				<ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
					{#each recent as p (p.novel_id)}
						{@const n = novelById.get(p.novel_id)}
						<li>
							{#if n}
								<a
									href={`/reader/${n.slug}/${p.chapter_idx}`}
									class="flex items-center justify-between p-3 hover:bg-slate-50"
								>
									<span>
										<span class="font-bold">{n.title_my}</span>
										<span class="ml-2 text-xs text-slate-500">ch.{p.chapter_idx + 1}</span>
									</span>
									<span class="text-xs text-slate-400">{fmtDate(p.updated_at)}</span>
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="mt-8">
			<h2 class="mb-2 text-lg font-bold">Bookmarks</h2>
			{#if bookmarks.length === 0}
				<p class="text-sm text-slate-500">
					No bookmarks yet. Open a chapter and tap <span class="font-bold">Bookmark</span>.
				</p>
			{:else}
				<ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
					{#each bookmarks as bm (bm.id)}
						{@const n = novelById.get(bm.novel_id)}
						<li class="flex items-center gap-3 p-3">
							<a
								href={n ? `/reader/${n.slug}/${bm.chapter_idx}` : '#'}
								class="flex-1 hover:underline"
							>
								<p class="font-bold">{n?.title_my ?? '(missing)'}</p>
								<p class="text-xs text-slate-500">
									ch.{bm.chapter_idx + 1} · {Math.round(bm.scroll_pct * 100)}% · {fmtDate(
										bm.created_at
									)}
								</p>
							</a>
							<button
								type="button"
								onclick={() => onRemove(bm.id)}
								class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
								aria-label="Remove bookmark"
							>
								Remove
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
</section>
