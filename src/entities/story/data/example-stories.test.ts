import { describe, expect, test } from 'vitest';
import { validateStory } from '../model/validate-story';
import { exampleStories, getExampleStory } from './example-stories';

describe('exampleStories', () => {
	test.each(exampleStories.map((story) => [story.title, story] as const))('"%s" has no issues', (_title, story) => {
		expect(validateStory(story)).toEqual([]);
	});

	test('every example has a unique id', () => {
		const ids = exampleStories.map((story) => story.id);

		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('getExampleStory', () => {
	test('finds an example by id', () => {
		expect(getExampleStory('night-market')?.title).toBe('The Night Market');
	});

	test('returns undefined for an unknown id', () => {
		expect(getExampleStory('unknown')).toBeUndefined();
	});
});
