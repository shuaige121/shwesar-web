export type ReaderPosition = {
	itemId: string;
	chapterIndex: number;
	scrollOffset: number;
};

export const createReaderPosition = (itemId: string): ReaderPosition => ({
	itemId,
	chapterIndex: 0,
	scrollOffset: 0
});

export * from './progress';
export * from './font-settings';
export {
	splitMyanmarSentences,
	splitMyanmarPhrases,
	countMyanmarSentences,
	estimateReadingMinutes
} from '../myanmar-text';
