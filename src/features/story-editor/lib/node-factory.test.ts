import { describe, expect, test } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import { addNode } from '@/entities/story/model/story-operations';
import { validateStory } from '@/entities/story/model/validate-story';
import { createNode } from './node-factory';

describe('createNode', () => {
	test('creates a start node', () => {
		expect(createNode('start', 'new-start')).toEqual({ id: 'new-start', type: 'start', title: 'Start' });
	});

	test('creates a linear scene', () => {
		expect(createNode('scene', 'new-scene')).toEqual({
			id: 'new-scene',
			type: 'scene',
			title: 'New scene',
			text: '',
			choices: [],
		});
	});

	test('creates an ending', () => {
		expect(createNode('ending', 'new-ending')).toEqual({
			id: 'new-ending',
			type: 'ending',
			title: 'New ending',
			text: '',
		});
	});

	test('a new scene is added to the story and reported until it is connected', () => {
		const story = addNode(whisperingForest, createNode('scene', 'new-scene'));

		expect(validateStory(story)).toEqual([
			{ code: 'dead-end', severity: 'error', nodeId: 'new-scene' },
			{ code: 'unreachable-node', severity: 'warning', nodeId: 'new-scene' },
		]);
	});
});
