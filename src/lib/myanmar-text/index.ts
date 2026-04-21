export const myanmarSentenceBoundary = '။';
export const myanmarPhraseBoundary = '၊';

export interface SentenceSplitOptions {
	keepBoundary?: boolean;
}

export const splitMyanmarSentences = (
	text: string,
	options: SentenceSplitOptions = {}
): string[] => {
	const { keepBoundary = true } = options;
	if (!text) return [];
	const out: string[] = [];
	let buf = '';
	for (const ch of text) {
		if (ch === myanmarSentenceBoundary) {
			const inner = buf.trim();
			if (inner) out.push(keepBoundary ? inner + ch : inner);
			buf = '';
			continue;
		}
		buf += ch;
	}
	const tail = buf.trim();
	if (tail) out.push(tail);
	return out;
};

export const splitMyanmarPhrases = (text: string): string[] => {
	if (!text) return [];
	return text
		.split(myanmarPhraseBoundary)
		.map((p) => p.trim())
		.filter(Boolean);
};

export const countMyanmarSentences = (text: string): number =>
	splitMyanmarSentences(text, { keepBoundary: false }).length;

export const estimateReadingMinutes = (text: string, charsPerMinute = 600): number => {
	if (!text) return 0;
	return Math.max(1, Math.ceil(text.length / charsPerMinute));
};
