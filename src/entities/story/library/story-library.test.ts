import { describe, expect, test } from 'vitest';
import { lanternFerry } from '../data/examples/lantern-ferry';
import { nightMarket } from '../data/examples/night-market';
import { whisperingForest } from '../data/examples/whispering-forest';
import { parseLibrary, removeStory, serializeLibrary, upsertStory } from './story-library';

describe('parseLibrary', () => {
	test('reads stories written by serializeLibrary', () => {
		const stories = [whisperingForest, lanternFerry];

		expect(parseLibrary(serializeLibrary(stories))).toEqual(stories);
	});

	test('returns an empty list when nothing is stored', () => {
		expect(parseLibrary(null)).toEqual([]);
	});

	test('returns an empty list for invalid JSON', () => {
		expect(parseLibrary('{not json')).toEqual([]);
	});

	test('returns an empty list for an unknown version', () => {
		expect(parseLibrary(JSON.stringify({ version: 99, stories: [whisperingForest] }))).toEqual([]);
	});

	test('returns an empty list when the stored value has the wrong shape', () => {
		expect(parseLibrary(JSON.stringify([whisperingForest]))).toEqual([]);
		expect(parseLibrary(JSON.stringify({ version: 1, stories: 'none' }))).toEqual([]);
	});

	test('skips entries that are not stories', () => {
		const raw = JSON.stringify({ version: 1, stories: [whisperingForest, { id: 'broken' }, null] });

		expect(parseLibrary(raw)).toEqual([whisperingForest]);
	});
});

describe('upsertStory', () => {
	test('puts a new story first', () => {
		expect(upsertStory([whisperingForest], lanternFerry)).toEqual([lanternFerry, whisperingForest]);
	});

	test('replaces an existing story and moves it first', () => {
		const edited = { ...nightMarket, title: 'Edited market' };

		expect(upsertStory([whisperingForest, nightMarket, lanternFerry], edited)).toEqual([
			edited,
			whisperingForest,
			lanternFerry,
		]);
	});
});

describe('removeStory', () => {
	test('removes the story with the given id', () => {
		expect(removeStory([whisperingForest, lanternFerry], whisperingForest.id)).toEqual([lanternFerry]);
	});

	test('keeps the list unchanged for an unknown id', () => {
		expect(removeStory([whisperingForest], 'unknown')).toEqual([whisperingForest]);
	});
});
