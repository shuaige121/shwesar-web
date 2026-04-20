<svelte:head>
	<title>ShweSar</title>
</svelte:head>

<main class="min-h-screen bg-brand-paper text-brand-ink">
	<section
		class="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[1fr_380px] md:items-center md:py-12"
	>
		<div class="space-y-6">
			<img class="h-16 w-16 rounded-lg" src="/brand/shwesar_logo.png" alt="ShweSar logo" />
			<div class="space-y-3">
				<p class="text-sm font-bold text-brand-leaf">ရွှေစာ ShweSar</p>
				<h1 class="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
					Myanmar reading and audio courses, built for offline days.
				</h1>
				<p class="max-w-2xl text-lg leading-8 text-slate-700">
					Novels, audiobooks, and hands-busy lessons share one low-bandwidth library for readers and
					listeners.
				</p>
			</div>
			<nav class="flex flex-wrap gap-3" aria-label="Primary sections">
				<a class="rounded-lg bg-brand-leaf px-4 py-3 font-bold text-white" href="/reader">Reader</a>
				<a class="rounded-lg border border-slate-300 px-4 py-3 font-bold" href="/audiobooks"
					>Audiobooks</a
				>
				<a class="rounded-lg border border-slate-300 px-4 py-3 font-bold" href="/courses">Courses</a
				>
				<a class="rounded-lg border border-slate-300 px-4 py-3 font-bold" href="/library">Library</a
				>
			</nav>
		</div>
		<img
			class="aspect-[11/6] w-full rounded-lg object-cover shadow-sm"
			src="/brand/shwesar_banner.png"
			alt="ShweSar banner"
		/>
	</section>
</main>
