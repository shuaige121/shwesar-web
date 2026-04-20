export const myanmarSentenceBoundary = '။';

export const splitMyanmarSentences = (text: string): string[] =>
	text
		.split(myanmarSentenceBoundary)
		.map((sentence) => sentence.trim())
		.filter(Boolean);
