import { describe, expect, test } from 'vitest';
import { whisperingForest } from '../data/examples/whispering-forest';
import { getNextNode, getNextNodeByChoice, getNode, getStartNode } from './story-engine';

describe('Story Engine', () => {
	test('returns the start node', () => {
		const node = getStartNode(whisperingForest);

		expect(node?.id).toBe('start');
	});

	test('returns a node by id', () => {
		const node = getNode(whisperingForest, 'forest');

		expect(node?.type).toBe('scene');
		expect(node?.id).toBe('forest');
	});

	test('returns the next node', () => {
		const node = getNextNode(whisperingForest, 'start');

		expect(node?.id).toBe('forest');
	});

	test('returns the node selected by choice', () => {
		const node = getNextNodeByChoice(whisperingForest, 'forest', 'follow-whisper');

		expect(node?.id).toBe('whisper');
	});

	test('returns undefined for an unknown choice', () => {
		const node = getNextNodeByChoice(whisperingForest, 'forest', 'unknown-choice');

		expect(node).toBeUndefined();
	});

	test('does not follow choice edges when continuing', () => {
		const node = getNextNode(whisperingForest, 'forest');

		expect(node).toBeUndefined();
	});
});
