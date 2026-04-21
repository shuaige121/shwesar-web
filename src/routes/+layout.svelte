<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { seedFromStatic, seedAudioFromStatic } from '$lib/offline-cache';
	import MiniPlayer from '$lib/player/MiniPlayer.svelte';

	let { children } = $props();

	let installEvent = $state<Event | null>(null);
	let installAvailable = $state(false);
	let seedError = $state<string | null>(null);

	onMount(() => {
		if (!browser) return;
		const onPrompt = (e: Event) => {
			e.preventDefault();
			installEvent = e;
			installAvailable = true;
		};
		window.addEventListener('beforeinstallprompt', onPrompt);

		Promise.all([seedFromStatic(), seedAudioFromStatic()]).catch((err) => {
			seedError = err instanceof Error ? err.message : String(err);
		});

		return () => {
			window.removeEventListener('beforeinstallprompt', onPrompt);
		};
	});

	const triggerInstall = async () => {
		const evt = installEvent as unknown as { prompt?: () => Promise<void> } | null;
		if (!evt?.prompt) return;
		await evt.prompt();
		installEvent = null;
		installAvailable = false;
	};

	const navItems = [
		{ href: '/reader', label: 'Reader', label_my: 'ဖတ်စာ' },
		{ href: '/audiobooks', label: 'Audio', label_my: 'အသံ' },
		{ href: '/courses', label: 'Courses', label_my: 'သင်ခန်းစာ' },
		{ href: '/library', label: 'Library', label_my: 'စာကြည့်တိုက်' }
	];
</script>

<svelte:head>
	<link rel="icon" href="/brand/shwesar_logo.png" />
</svelte:head>

<div class="min-h-screen bg-brand-paper pb-24 text-brand-ink">
	<header class="sticky top-0 z-20 border-b border-slate-200 bg-brand-paper/90 backdrop-blur">
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
			<a href="/" class="flex items-center gap-2" aria-label="ShweSar home">
				<img src="/brand/shwesar_logo.png" alt="" class="h-8 w-8 rounded" />
				<span class="font-bold">ရွှေစာ ShweSar</span>
			</a>
			<nav class="flex items-center gap-1 text-sm" aria-label="Primary">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="rounded px-2 py-1 hover:bg-slate-100 {$page.url.pathname.startsWith(item.href)
							? 'font-bold text-brand-leaf'
							: ''}"
						aria-current={$page.url.pathname.startsWith(item.href) ? 'page' : undefined}
					>
						<span class="hidden sm:inline">{item.label_my}</span>
						<span class="sm:hidden">{item.label}</span>
					</a>
				{/each}
				{#if installAvailable}
					<button
						type="button"
						onclick={triggerInstall}
						class="ml-2 rounded bg-brand-leaf px-2 py-1 text-xs font-bold text-white"
					>
						Install
					</button>
				{/if}
			</nav>
		</div>
		{#if seedError}
			<p class="bg-amber-100 px-4 py-1 text-xs text-amber-900">
				Seed load failed: {seedError}. Library may be empty until you reload.
			</p>
		{/if}
	</header>

	<main>{@render children()}</main>

	<MiniPlayer />

	<footer class="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
		<p>ShweSar — offline reading and audio courses for Myanmar.</p>
	</footer>
</div>
