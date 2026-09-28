import { describe, expect, test } from 'vitest';
import { demoStory } from '../data/demo-story';
import { getNextNode, getNextNodeByChoice, getNode, getStartNode } from './story-engine';

describe('Story Engine', () => {
	test('returns the start node', () => {
		const node = getStartNode(demoStory);

		expect(node?.id).toBe('start');
	});

	test('returns a node by id', () => {
		const node = getNode(demoStory, 'forest');

		expect(node?.type).toBe('scene');
		expect(node?.id).toBe('forest');
	});

	test('returns the next node', () => {
		const node = getNextNode(demoStory, 'start');

		expect(node?.id).toBe('forest');
	});

	test('returns the node selected by choice', () => {
		const node = getNextNodeByChoice(demoStory, 'first-choice', 'follow-whisper');

		expect(node?.id).toBe('whisper');
	});

	test('returns undefined for an unknown choice', () => {
		const node = getNextNodeByChoice(demoStory, 'first-choice', 'unknown-choice');

		expect(node).toBeUndefined();
	});
});
