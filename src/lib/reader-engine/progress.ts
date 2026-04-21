import { saveProgress } from '../offline-cache/db';

export const computeScrollPct = (el: HTMLElement | Window = window): number => {
	if (el === window) {
		const doc = document.documentElement;
		const scrollable = doc.scrollHeight - window.innerHeight;
		if (scrollable <= 0) return 1;
		return Math.min(1, Math.max(0, window.scrollY / scrollable));
	}
	const node = el as HTMLElement;
	const scrollable = node.scrollHeight - node.clientHeight;
	if (scrollable <= 0) return 1;
	return Math.min(1, Math.max(0, node.scrollTop / scrollable));
};

export interface ProgressTrackerOptions {
	novelId: number;
	chapterIdx: number;
	target?: HTMLElement | Window;
	debounceMs?: number;
}

export const startProgressTracker = ({
	novelId,
	chapterIdx,
	target = typeof window === 'undefined' ? (undefined as unknown as Window) : window,
	debounceMs = 500
}: ProgressTrackerOptions): (() => void) => {
	if (!target) return () => {};
	let timer: ReturnType<typeof setTimeout> | null = null;
	let lastSaved = -1;
	const onScroll = () => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			const pct = computeScrollPct(target);
			if (Math.abs(pct - lastSaved) < 0.005) return;
			lastSaved = pct;
			void saveProgress(novelId, chapterIdx, pct);
		}, debounceMs);
	};
	target.addEventListener('scroll', onScroll, { passive: true });
	return () => {
		if (timer) clearTimeout(timer);
		target.removeEventListener('scroll', onScroll);
	};
};

export const restoreScroll = (pct: number, target: HTMLElement | Window = window): void => {
	if (target === window) {
		const doc = document.documentElement;
		const scrollable = doc.scrollHeight - window.innerHeight;
		window.scrollTo({ top: scrollable * pct, behavior: 'auto' });
		return;
	}
	const node = target as HTMLElement;
	const scrollable = node.scrollHeight - node.clientHeight;
	node.scrollTo({ top: scrollable * pct, behavior: 'auto' });
};
