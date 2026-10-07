import { describe, expect, test } from 'vitest';
import { createHistory, pushHistory, redo, undo } from './history';

describe('pushHistory', () => {
	test('moves the present to the past', () => {
		const result = pushHistory(createHistory('a'), 'b');

		expect(result).toEqual({ past: ['a'], present: 'b', future: [] });
	});

	test('clears the redo steps', () => {
		const history = undo(pushHistory(createHistory('a'), 'b'));

		expect(pushHistory(history, 'c')).toEqual({ past: ['a'], present: 'c', future: [] });
	});

	test('drops the oldest steps over the limit', () => {
		let history = createHistory(0);

		for (let step = 1; step <= 5; step++) {
			history = pushHistory(history, step, 3);
		}

		expect(history.past).toEqual([2, 3, 4]);
		expect(history.present).toBe(5);
	});

	test('does not mutate the original history', () => {
		const history = pushHistory(createHistory('a'), 'b');
		const before = structuredClone(history);

		pushHistory(history, 'c');

		expect(history).toEqual(before);
	});
});

describe('undo and redo', () => {
	test('undo restores the previous state and redo returns to the next one', () => {
		const history = pushHistory(pushHistory(createHistory('a'), 'b'), 'c');
		const undone = undo(history);

		expect(undone).toEqual({ past: ['a'], present: 'b', future: ['c'] });
		expect(redo(undone)).toEqual(history);
	});

	test('undo twice and redo twice return to the latest state', () => {
		const history = pushHistory(pushHistory(createHistory('a'), 'b'), 'c');
		const undone = undo(undo(history));

		expect(undone.present).toBe('a');
		expect(redo(redo(undone))).toEqual(history);
	});

	test('undo without past steps returns the same history', () => {
		const history = createHistory('a');

		expect(undo(history)).toBe(history);
	});

	test('redo without future steps returns the same history', () => {
		const history = pushHistory(createHistory('a'), 'b');

		expect(redo(history)).toBe(history);
	});

	test('does not mutate the original history', () => {
		const history = undo(pushHistory(pushHistory(createHistory('a'), 'b'), 'c'));
		const before = structuredClone(history);

		undo(history);
		redo(history);

		expect(history).toEqual(before);
	});
});
