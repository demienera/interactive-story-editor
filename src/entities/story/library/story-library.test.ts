import { describe, expect, test } from 'vitest';
import { lanternFerry } from '../data/examples/lantern-ferry';
import { nightMarket } from '../data/examples/night-market';
import { whisperingForest } from '../data/examples/whispering-forest';
import {
	parseLibrary,
	pruneLayout,
	removeEntry,
	serializeLibrary,
	upsertEntry,
	type LibraryEntry,
} from './story-library';

const forestEntry: LibraryEntry = { story: whisperingForest, layout: { start: { x: 0, y: 0 } } };
const ferryEntry: LibraryEntry = { story: lanternFerry, layout: {} };
const marketEntry: LibraryEntry = { story: nightMarket, layout: {} };

function stored(entries: unknown[]): string {
	return JSON.stringify({ version: 2, entries });
}

describe('parseLibrary', () => {
	test('reads entries written by serializeLibrary', () => {
		const entries = [forestEntry, ferryEntry];

		expect(parseLibrary(serializeLibrary(entries))).toEqual(entries);
	});

	test('reads version 1 stories with an empty layout', () => {
		const raw = JSON.stringify({ version: 1, stories: [whisperingForest, lanternFerry] });

		expect(parseLibrary(raw)).toEqual([
			{ story: whisperingForest, layout: {} },
			{ story: lanternFerry, layout: {} },
		]);
	});

	test('returns an empty list when nothing is stored', () => {
		expect(parseLibrary(null)).toEqual([]);
	});

	test('returns an empty list for invalid JSON', () => {
		expect(parseLibrary('{not json')).toEqual([]);
	});

	test('returns an empty list for an unknown version', () => {
		expect(parseLibrary(JSON.stringify({ version: 99, entries: [forestEntry] }))).toEqual([]);
	});

	test('returns an empty list when the stored value has the wrong shape', () => {
		expect(parseLibrary(JSON.stringify([forestEntry]))).toEqual([]);
		expect(parseLibrary(JSON.stringify({ version: 2, entries: 'none' }))).toEqual([]);
	});

	test('skips entries without a story', () => {
		const raw = stored([forestEntry, { story: { id: 'broken' }, layout: {} }, null, { layout: {} }]);

		expect(parseLibrary(raw)).toEqual([forestEntry]);
	});

	test('keeps the story when its layout is broken', () => {
		const raw = stored([
			{ story: whisperingForest, layout: { start: { x: 'left', y: 0 } } },
			{ story: lanternFerry, layout: [1, 2] },
			{ story: nightMarket },
		]);

		expect(parseLibrary(raw)).toEqual([
			{ story: whisperingForest, layout: {} },
			{ story: lanternFerry, layout: {} },
			{ story: nightMarket, layout: {} },
		]);
	});
});

describe('pruneLayout', () => {
	test('keeps only positions of nodes in the story', () => {
		const layout = { start: { x: 0, y: 0 }, forest: { x: 10, y: 20 }, deleted: { x: 5, y: 5 } };

		expect(pruneLayout(whisperingForest, layout)).toEqual({ start: { x: 0, y: 0 }, forest: { x: 10, y: 20 } });
	});
});

describe('upsertEntry', () => {
	test('puts a new entry first', () => {
		expect(upsertEntry([forestEntry], ferryEntry)).toEqual([ferryEntry, forestEntry]);
	});

	test('replaces the entry of the same story and moves it first', () => {
		const edited: LibraryEntry = { story: { ...nightMarket, title: 'Edited market' }, layout: {} };

		expect(upsertEntry([forestEntry, marketEntry, ferryEntry], edited)).toEqual([edited, forestEntry, ferryEntry]);
	});
});

describe('removeEntry', () => {
	test('removes the entry with the given story id', () => {
		expect(removeEntry([forestEntry, ferryEntry], whisperingForest.id)).toEqual([ferryEntry]);
	});

	test('keeps the list unchanged for an unknown id', () => {
		expect(removeEntry([forestEntry], 'unknown')).toEqual([forestEntry]);
	});
});
