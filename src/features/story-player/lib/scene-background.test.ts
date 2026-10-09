import { describe, expect, test } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import { getNode } from '@/entities/story/model/story-engine';
import type { EndingNode, SceneNode, StoryNode } from '@/entities/story/model/types';
import {
	DEFAULT_BACKGROUND,
	getNodeBackground,
	getSceneBackground,
	getUpcomingNodes,
	showBackground,
} from './scene-background';

const scene: SceneNode = { id: 'gate', type: 'scene', title: 'The Gate', text: '', choices: [] };
const ending: EndingNode = { id: 'end', type: 'ending', title: 'The End', text: '' };

function getExampleNode(id: string): StoryNode {
	const node = getNode(whisperingForest, id);

	if (!node) {
		throw new Error(`The example must have a "${id}" node.`);
	}

	return node;
}

describe('getNodeBackground', () => {
	test('returns a known background', () => {
		expect(getNodeBackground({ ...scene, background: 'forest-shrine' })).toBe('forest-shrine');
	});

	test('ignores a missing or unknown background', () => {
		expect(getNodeBackground(scene)).toBeUndefined();
		expect(getNodeBackground({ ...ending, background: 'removed-image' })).toBeUndefined();
	});
});

describe('getSceneBackground', () => {
	test('a node with a background changes it', () => {
		expect(getSceneBackground('misty-night', { ...scene, background: 'forest-shrine' })).toBe('forest-shrine');
	});

	test('a node without a background keeps the current one', () => {
		expect(getSceneBackground('forest-shrine', scene)).toBe('forest-shrine');
		expect(getSceneBackground('forest-shrine', { ...ending, background: 'removed-image' })).toBe('forest-shrine');
	});

	test('the start node shows its own background', () => {
		expect(
			getSceneBackground('forest-shrine', { id: 'start', type: 'start', title: 'Start', background: 'crossroads' }),
		).toBe('crossroads');
	});

	test('a start node without a background goes back to the default background', () => {
		expect(getSceneBackground('forest-shrine', { id: 'start', type: 'start', title: 'Start' })).toBe(
			DEFAULT_BACKGROUND,
		);
	});
});

describe('showBackground', () => {
	test('starts with one layer', () => {
		expect(showBackground([], 'misty-night')).toEqual([{ key: 0, background: 'misty-night' }]);
	});

	test('keeps the same layers when the background does not change', () => {
		const layers = [{ key: 0, background: 'misty-night' }];

		expect(showBackground(layers, 'misty-night')).toBe(layers);
	});

	test('puts the new background on top of the previous one', () => {
		const layers = [
			{ key: 0, background: 'misty-night' },
			{ key: 1, background: 'forest-shrine' },
		];

		expect(showBackground(layers, 'misty-night')).toEqual([
			{ key: 1, background: 'forest-shrine' },
			{ key: 2, background: 'misty-night' },
		]);
	});
});

describe('getUpcomingNodes', () => {
	test('returns the target of every choice', () => {
		expect(getUpcomingNodes(whisperingForest, getExampleNode('forest')).map((node) => node.id)).toEqual([
			'whisper',
			'shelter',
		]);
	});

	test('returns the next node of a linear scene', () => {
		expect(getUpcomingNodes(whisperingForest, getExampleNode('whisper')).map((node) => node.id)).toEqual([
			'mysterious-shrine',
		]);
	});

	test('returns nothing for an ending or an exit without an edge', () => {
		expect(getUpcomingNodes(whisperingForest, getExampleNode('old-cabin'))).toEqual([]);
		expect(getUpcomingNodes({ ...whisperingForest, edges: [] }, getExampleNode('whisper'))).toEqual([]);
	});
});
