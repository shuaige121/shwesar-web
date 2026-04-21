<script lang="ts">
	import {
		playerStore,
		togglePlay,
		skipChapter,
		seekTo,
		stop,
		formatDuration
	} from './audio-player';

	const onScrub = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		seekTo(Number(target.value));
	};
</script>

{#if $playerStore.itemId !== null}
	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur"
		role="region"
		aria-label="Audio player"
	>
		<div class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2">
			<div class="flex items-center gap-3">
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-bold">
						{$playerStore.itemTitle}
					</p>
					<p class="truncate text-xs text-slate-500">
						{$playerStore.chapterTitle ?? ''}
						{#if $playerStore.error}<span class="text-red-600"> · {$playerStore.error}</span>{/if}
					</p>
				</div>
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => skipChapter(-1)}
						class="rounded p-2 text-slate-700 hover:bg-slate-100"
						aria-label="Previous chapter"
						disabled={$playerStore.chapterIdx === 0}
					>
						⏮
					</button>
					<button
						type="button"
						onclick={togglePlay}
						class="rounded-full bg-brand-leaf px-4 py-2 text-white"
						aria-label={$playerStore.state === 'playing' ? 'Pause' : 'Play'}
					>
						{$playerStore.state === 'playing' ? '⏸' : '▶'}
					</button>
					<button
						type="button"
						onclick={() => skipChapter(1)}
						class="rounded p-2 text-slate-700 hover:bg-slate-100"
						aria-label="Next chapter"
						disabled={$playerStore.chapterIdx >= $playerStore.chapterCount - 1}
					>
						⏭
					</button>
					<button
						type="button"
						onclick={stop}
						class="ml-1 rounded p-2 text-slate-500 hover:bg-slate-100"
						aria-label="Close player"
					>
						✕
					</button>
				</div>
			</div>
			<div class="flex items-center gap-2 text-xs text-slate-500">
				<span class="w-10 text-right">{formatDuration($playerStore.position_s)}</span>
				<input
					type="range"
					min="0"
					max={Math.max(1, $playerStore.duration_s)}
					value={$playerStore.position_s}
					step="1"
					onchange={onScrub}
					class="h-1 flex-1 accent-brand-leaf"
					aria-label="Seek"
				/>
				<span class="w-10">{formatDuration($playerStore.duration_s)}</span>
			</div>
		</div>
	</div>
{/if}
