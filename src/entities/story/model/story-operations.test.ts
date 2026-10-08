import { describe, expect, test } from 'vitest';
import { getNextNodeByChoice } from './story-engine';
import {
	addNode,
	connect,
	disconnect,
	removeNode,
	type StoryNodePatch,
	updateNode,
	updateStoryDetails,
} from './story-operations';
import type { Story } from './types';

function createStory(): Story {
	return {
		id: 'test-story',
		title: 'Test Story',
		description: '',
		nodes: [
			{ id: 'start', type: 'start', title: 'Start' },
			{
				id: 'gate',
				type: 'scene',
				title: 'The Gate',
				text: 'Two paths lead away from the gate.',
				choices: [
					{ id: 'go-left', label: 'Go left' },
					{ id: 'go-right', label: 'Go right' },
				],
			},
			{ id: 'left-end', type: 'ending', title: 'Left End', text: 'You went left.' },
			{ id: 'right-end', type: 'ending', title: 'Right End', text: 'You went right.' },
		],
		edges: [
			{ id: 'start-to-gate', type: 'continue', source: 'start', target: 'gate' },
			{ id: 'gate-left', type: 'choice', source: 'gate', target: 'left-end', choiceId: 'go-left' },
			{ id: 'gate-right', type: 'choice', source: 'gate', target: 'right-end', choiceId: 'go-right' },
		],
	};
}

describe('addNode', () => {
	test('adds a node', () => {
		const story = createStory();
		const result = addNode(story, { id: 'cave', type: 'scene', title: 'Cave', text: '', choices: [] });

		expect(result.nodes.map((node) => node.id)).toEqual(['start', 'gate', 'left-end', 'right-end', 'cave']);
	});

	test('does not mutate the original story', () => {
		const story = createStory();
		const before = structuredClone(story);

		addNode(story, { id: 'cave', type: 'scene', title: 'Cave', text: '', choices: [] });

		expect(story).toEqual(before);
	});

	test('throws for a duplicate id', () => {
		expect(() => addNode(createStory(), { id: 'gate', type: 'ending', title: 'Copy', text: '' })).toThrow(
			'Node "gate" already exists.',
		);
	});
});

describe('updateNode', () => {
	test('updates the node fields', () => {
		const result = updateNode(createStory(), 'left-end', { type: 'ending', title: 'The Left Path' });

		expect(result.nodes.find((node) => node.id === 'left-end')).toEqual({
			id: 'left-end',
			type: 'ending',
			title: 'The Left Path',
			text: 'You went left.',
		});
	});

	test('keeps other nodes as the same objects', () => {
		const story = createStory();
		const result = updateNode(story, 'left-end', { type: 'ending', title: 'The Left Path' });

		expect(result.nodes[0]).toBe(story.nodes[0]);
		expect(result.nodes[1]).toBe(story.nodes[1]);
	});

	test('does not mutate the original story', () => {
		const story = createStory();
		const before = structuredClone(story);

		updateNode(story, 'gate', { type: 'scene', title: 'Changed', choices: [] });

		expect(story).toEqual(before);
	});

	test('removes the edge of a removed choice and keeps other edges', () => {
		const result = updateNode(createStory(), 'gate', {
			type: 'scene',
			choices: [{ id: 'go-right', label: 'Go right' }],
		});

		expect(result.edges.map((edge) => edge.id)).toEqual(['start-to-gate', 'gate-right']);
	});

	test('keeps edges when choices are not part of the patch', () => {
		const story = createStory();
		const result = updateNode(story, 'gate', { type: 'scene', title: 'The Old Gate' });

		expect(result.edges).toEqual(story.edges);
	});

	test('throws when the patch type does not match the node type', () => {
		expect(() => updateNode(createStory(), 'gate', { type: 'ending', title: 'Gate' })).toThrow(
			'Cannot apply a "ending" patch to scene node "gate".',
		);
	});

	test('does not allow fields of another node type in a patch', () => {
		const patch: StoryNodePatch = {
			type: 'ending',
			// @ts-expect-error: an ending patch has no `choices`
			choices: [],
		};

		expect(patch.type).toBe('ending');
	});

	test('throws for an unknown node', () => {
		expect(() => updateNode(createStory(), 'unknown', { type: 'start', title: 'Start' })).toThrow(
			'Node "unknown" does not exist.',
		);
	});
});

describe('removeNode', () => {
	test('removes the node with its incoming and outgoing edges', () => {
		const result = removeNode(createStory(), 'gate');

		expect(result.nodes.map((node) => node.id)).toEqual(['start', 'left-end', 'right-end']);
		expect(result.edges).toEqual([]);
	});

	test('keeps edges that are not connected to the node', () => {
		const result = removeNode(createStory(), 'left-end');

		expect(result.edges.map((edge) => edge.id)).toEqual(['start-to-gate', 'gate-right']);
	});

	test('does not mutate the original story', () => {
		const story = createStory();
		const before = structuredClone(story);

		removeNode(story, 'gate');

		expect(story).toEqual(before);
	});

	test('throws for an unknown node', () => {
		expect(() => removeNode(createStory(), 'unknown')).toThrow('Node "unknown" does not exist.');
	});
});

describe('connect', () => {
	test('adds a continue edge', () => {
		const result = connect(createStory(), {
			id: 'start-to-left',
			type: 'continue',
			source: 'start',
			target: 'left-end',
		});

		expect(result.edges.at(-1)).toEqual({ id: 'start-to-left', type: 'continue', source: 'start', target: 'left-end' });
	});

	test('adds a choice edge that the Story Engine follows', () => {
		const story = removeNode(createStory(), 'right-end');
		const withEnding = addNode(story, { id: 'new-end', type: 'ending', title: 'New End', text: '' });
		const result = connect(withEnding, {
			id: 'gate-right-new',
			type: 'choice',
			source: 'gate',
			target: 'new-end',
			choiceId: 'go-right',
		});

		expect(getNextNodeByChoice(result, 'gate', 'go-right')?.id).toBe('new-end');
	});

	test('does not mutate the original story', () => {
		const story = createStory();
		const before = structuredClone(story);

		connect(story, { id: 'start-to-left', type: 'continue', source: 'start', target: 'left-end' });

		expect(story).toEqual(before);
	});

	test('throws for a duplicate edge id', () => {
		expect(() =>
			connect(createStory(), { id: 'start-to-gate', type: 'continue', source: 'start', target: 'left-end' }),
		).toThrow('Edge "start-to-gate" already exists.');
	});

	test('throws for a missing source node', () => {
		expect(() => connect(createStory(), { id: 'e', type: 'continue', source: 'unknown', target: 'gate' })).toThrow(
			'Source node "unknown" does not exist.',
		);
	});

	test('throws for a missing target node', () => {
		expect(() => connect(createStory(), { id: 'e', type: 'continue', source: 'start', target: 'unknown' })).toThrow(
			'Target node "unknown" does not exist.',
		);
	});

	test('throws for a choice that does not exist in the source scene', () => {
		expect(() =>
			connect(createStory(), { id: 'e', type: 'choice', source: 'gate', target: 'left-end', choiceId: 'unknown' }),
		).toThrow('Choice "unknown" does not exist in scene "gate".');
	});

	test('throws for a choice edge that does not start from a scene', () => {
		expect(() =>
			connect(createStory(), { id: 'e', type: 'choice', source: 'start', target: 'gate', choiceId: 'go-left' }),
		).toThrow('Choice edge "e" must start from a scene.');
	});
});

describe('disconnect', () => {
	test('removes the edge', () => {
		const result = disconnect(createStory(), 'gate-left');

		expect(result.edges.map((edge) => edge.id)).toEqual(['start-to-gate', 'gate-right']);
	});

	test('does not mutate the original story', () => {
		const story = createStory();
		const before = structuredClone(story);

		disconnect(story, 'gate-left');

		expect(story).toEqual(before);
	});

	test('throws for an unknown edge', () => {
		expect(() => disconnect(createStory(), 'unknown')).toThrow('Edge "unknown" does not exist.');
	});
});

describe('updateStoryDetails', () => {
	test('changes the title and the description', () => {
		const story = createStory();
		const updated = updateStoryDetails(story, { title: 'New title', description: 'New description' });

		expect(updated.title).toBe('New title');
		expect(updated.description).toBe('New description');
		expect(updated.id).toBe(story.id);
	});

	test('keeps fields that are not in the patch', () => {
		const story = createStory();

		expect(updateStoryDetails(story, { description: 'Only this' }).title).toBe('Test Story');
	});

	test('keeps nodes and edges by reference', () => {
		const story = createStory();
		const updated = updateStoryDetails(story, { title: 'New title' });

		expect(updated.nodes).toBe(story.nodes);
		expect(updated.edges).toBe(story.edges);
	});

	test('returns the same story when nothing changes', () => {
		const story = createStory();

		expect(updateStoryDetails(story, { title: 'Test Story', description: '' })).toBe(story);
	});

	test('does not mutate the story', () => {
		const story = createStory();

		updateStoryDetails(story, { title: 'New title' });

		expect(story.title).toBe('Test Story');
	});
});
