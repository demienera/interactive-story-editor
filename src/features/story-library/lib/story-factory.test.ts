import { describe, expect, test } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import { validateStory } from '@/entities/story/model/validate-story';
import { copyStory, createEmptyStory } from './story-factory';

describe('createEmptyStory', () => {
	test('creates a story with one start node', () => {
		expect(createEmptyStory('story-1', 'start-1')).toEqual({
			id: 'story-1',
			title: 'Untitled story',
			description: '',
			nodes: [{ id: 'start-1', type: 'start', title: 'Start' }],
			edges: [],
		});
	});

	test('the new story reports that the start leads nowhere', () => {
		expect(validateStory(createEmptyStory('story-1', 'start-1'))).toEqual([
			{ code: 'dead-end', severity: 'error', nodeId: 'start-1' },
		]);
	});
});

describe('copyStory', () => {
	test('copies the story with a new id and title', () => {
		const copy = copyStory(whisperingForest, 'copy-1');

		expect(copy).toEqual({ ...whisperingForest, id: 'copy-1', title: 'The Whispering Forest (copy)' });
	});

	test('the copy stays valid', () => {
		expect(validateStory(copyStory(whisperingForest, 'copy-1'))).toEqual([]);
	});
});
