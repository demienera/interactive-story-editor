import { describe, expect, test } from 'vitest';
import { getTypedLength } from './typewriter';

describe('getTypedLength', () => {
	test('types one character per interval', () => {
		expect(getTypedLength(100, 0, 30)).toBe(0);
		expect(getTypedLength(100, 29, 30)).toBe(0);
		expect(getTypedLength(100, 30, 30)).toBe(1);
		expect(getTypedLength(100, 305, 30)).toBe(10);
	});

	test('never goes past the end of the text', () => {
		expect(getTypedLength(5, 10_000, 30)).toBe(5);
	});

	test('treats negative time as nothing typed', () => {
		expect(getTypedLength(5, -100, 30)).toBe(0);
	});
});
