<script lang="ts">
	import { onMount } from 'svelte';
	import { listAudioItems, type AudioItem } from '$lib/offline-cache';

	let items = $state<AudioItem[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			items = await listAudioItems('audiobook');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Audiobooks — ShweSar</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-6">
	<div class="mb-6">
		<p class="text-sm font-bold text-brand-leaf">အသံ စာအုပ် · Audiobooks</p>
		<h1 class="text-3xl font-bold">Listen offline</h1>
		<p class="text-sm text-slate-600">
			Background playback, lock-screen controls, resumes where you left off.
		</p>
	</div>

	{#if loading}
		<p class="text-sm text-slate-500">Loading…</p>
	{:else if items.length === 0}
		<div class="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
			No audiobooks yet. Reload the page to fetch the seed library.
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item (item.slug)}
				<li>
					<a
						href={`/audiobooks/${item.slug}`}
						class="flex h-full gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-leaf hover:shadow-sm"
					>
						{#if item.cover_url}
							<img
								src={item.cover_url}
								alt=""
								class="h-20 w-16 flex-none rounded object-cover"
								loading="lazy"
							/>
						{:else}
							<div
								class="flex h-20 w-16 flex-none items-center justify-center rounded bg-slate-100 text-xs text-slate-400"
								aria-hidden="true"
							>
								♪
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<p class="truncate font-bold">{item.title_my}</p>
							<p class="truncate text-xs text-slate-500">{item.title_en}</p>
							<p class="mt-1 text-xs text-slate-500">{item.source} · {item.license}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
