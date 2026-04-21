import { describe, expect, it } from 'vitest';
import {
	splitMyanmarSentences,
	splitMyanmarPhrases,
	countMyanmarSentences,
	estimateReadingMinutes
} from './index';

describe('splitMyanmarSentences', () => {
	it('returns empty array for empty input', () => {
		expect(splitMyanmarSentences('')).toEqual([]);
	});

	it('returns single sentence as one entry when no boundary present', () => {
		const text = 'မင်္ဂလာပါ';
		expect(splitMyanmarSentences(text)).toEqual(['မင်္ဂလာပါ']);
	});

	it('splits on the Myanmar full stop and keeps the boundary by default', () => {
		const text = 'မင်္ဂလာပါ။ ဂုဏ်ယူပါသည်။';
		expect(splitMyanmarSentences(text)).toEqual(['မင်္ဂလာပါ။', 'ဂုဏ်ယူပါသည်။']);
	});

	it('drops the boundary when keepBoundary is false', () => {
		const text = 'မင်္ဂလာပါ။ ဂုဏ်ယူပါသည်။';
		expect(splitMyanmarSentences(text, { keepBoundary: false })).toEqual([
			'မင်္ဂလာပါ',
			'ဂုဏ်ယူပါသည်'
		]);
	});

	it('skips empty pieces caused by repeated boundaries', () => {
		expect(splitMyanmarSentences('က။။ ခ။')).toEqual(['က။', 'ခ။']);
	});

	it('keeps trailing fragment with no boundary', () => {
		expect(splitMyanmarSentences('က။ နောက်တစ်ခု')).toEqual(['က။', 'နောက်တစ်ခု']);
	});
});

describe('splitMyanmarPhrases', () => {
	it('splits on Myanmar comma', () => {
		expect(splitMyanmarPhrases('က၊ ခ၊ ဂ')).toEqual(['က', 'ခ', 'ဂ']);
	});
});

describe('countMyanmarSentences', () => {
	it('counts boundary-terminated sentences', () => {
		expect(countMyanmarSentences('က။ ခ။ ဂ')).toBe(3);
	});
});

describe('estimateReadingMinutes', () => {
	it('returns 0 for empty', () => {
		expect(estimateReadingMinutes('')).toBe(0);
	});
	it('returns at least 1 for short input', () => {
		expect(estimateReadingMinutes('က')).toBe(1);
	});
	it('scales with length', () => {
		expect(estimateReadingMinutes('x'.repeat(1200))).toBe(2);
	});
});
