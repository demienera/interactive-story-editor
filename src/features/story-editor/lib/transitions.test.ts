import { describe, expect, test } from 'vitest';
import { getNextNode, getNextNodeByChoice } from '@/entities/story/model/story-engine';
import type { Story } from '@/entities/story/model/types';
import { validateStory } from '@/entities/story/model/validate-story';
import {
	canLeadTo,
	getExitFromHandle,
	getExits,
	getExitTarget,
	setExitTarget,
	updateNodeAndExits,
	type Exit,
} from './transitions';

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
				text: 'Two paths.',
				choices: [
					{ id: 'go-left', label: 'Go left' },
					{ id: 'go-right', label: 'Go right' },
				],
			},
			{ id: 'cave', type: 'scene', title: 'Cave', text: 'Dark.', choices: [] },
			{ id: 'left-end', type: 'ending', title: 'Left End', text: 'Left.' },
			{ id: 'right-end', type: 'ending', title: 'Right End', text: 'Right.' },
		],
		edges: [
			{ id: 'start-to-gate', type: 'continue', source: 'start', target: 'gate' },
			{ id: 'gate-left', type: 'choice', source: 'gate', target: 'cave', choiceId: 'go-left' },
			{ id: 'gate-right', type: 'choice', source: 'gate', target: 'right-end', choiceId: 'go-right' },
			{ id: 'cave-to-left', type: 'continue', source: 'cave', target: 'left-end' },
		],
	};
}

const goLeft: Exit = { type: 'choice', sourceId: 'gate', choiceId: 'go-left' };
const caveContinue: Exit = { type: 'continue', sourceId: 'cave' };

describe('getExits', () => {
	test('a start node and a linear scene have one Continue exit', () => {
		const [start, , cave] = createStory().nodes;

		expect(getExits(start)).toEqual([{ type: 'continue', sourceId: 'start' }]);
		expect(getExits(cave)).toEqual([caveContinue]);
	});

	test('a scene with choices has one exit per choice', () => {
		const gate = createStory().nodes[1];

		expect(getExits(gate)).toEqual([goLeft, { type: 'choice', sourceId: 'gate', choiceId: 'go-right' }]);
	});

	test('an ending has no exits', () => {
		expect(getExits(createStory().nodes[3])).toEqual([]);
	});
});

describe('getExitTarget', () => {
	test('returns the target of the exit edge', () => {
		expect(getExitTarget(createStory(), goLeft)).toBe('cave');
		expect(getExitTarget(createStory(), caveContinue)).toBe('left-end');
	});

	test('returns undefined for a disconnected exit', () => {
		const story = setExitTarget(createStory(), goLeft, null, 'unused');

		expect(getExitTarget(story, goLeft)).toBeUndefined();
	});
});

describe('setExitTarget', () => {
	test('replaces the old edge of the exit', () => {
		const story = setExitTarget(createStory(), goLeft, 'left-end', 'new-edge');

		expect(story.edges.filter((edge) => edge.source === 'gate')).toEqual([
			{ id: 'gate-right', type: 'choice', source: 'gate', target: 'right-end', choiceId: 'go-right' },
			{ id: 'new-edge', type: 'choice', source: 'gate', target: 'left-end', choiceId: 'go-left' },
		]);
		expect(getNextNodeByChoice(story, 'gate', 'go-left')?.id).toBe('left-end');
	});

	test('connects a Continue exit', () => {
		const story = setExitTarget(createStory(), caveContinue, 'right-end', 'new-edge');

		expect(getNextNode(story, 'cave')?.id).toBe('right-end');
		expect(story.edges.filter((edge) => edge.source === 'cave')).toHaveLength(1);
	});

	test('disconnects the exit when the target is null', () => {
		const story = setExitTarget(createStory(), goLeft, null, 'unused');

		expect(story.edges.map((edge) => edge.id)).toEqual(['start-to-gate', 'gate-right', 'cave-to-left']);
		expect(validateStory(story)).toContainEqual({
			code: 'missing-choice-edge',
			severity: 'error',
			nodeId: 'gate',
			choiceId: 'go-left',
		});
	});

	test('removes duplicate edges of the same exit', () => {
		const story: Story = {
			...createStory(),
			edges: [
				...createStory().edges,
				{ id: 'cave-duplicate', type: 'continue', source: 'cave', target: 'right-end' },
			],
		};
		const result = setExitTarget(story, caveContinue, 'right-end', 'new-edge');

		expect(result.edges.filter((edge) => edge.source === 'cave').map((edge) => edge.id)).toEqual(['new-edge']);
	});

	test('does not touch other exits of the same node', () => {
		const story = setExitTarget(createStory(), goLeft, 'left-end', 'new-edge');

		expect(getExitTarget(story, { type: 'choice', sourceId: 'gate', choiceId: 'go-right' })).toBe('right-end');
	});
});

describe('getExitFromHandle', () => {
	test('maps a choice handle to the choice exit', () => {
		expect(getExitFromHandle(createStory(), 'gate', 'go-left')).toEqual(goLeft);
	});

	test('maps the handle without id to the Continue exit', () => {
		expect(getExitFromHandle(createStory(), 'cave', null)).toEqual(caveContinue);
	});

	test('returns undefined for an unknown handle or node', () => {
		expect(getExitFromHandle(createStory(), 'gate', null)).toBeUndefined();
		expect(getExitFromHandle(createStory(), 'gate', 'unknown')).toBeUndefined();
		expect(getExitFromHandle(createStory(), 'unknown', null)).toBeUndefined();
	});
});

describe('canLeadTo', () => {
	test('allows scenes and endings', () => {
		expect(canLeadTo(createStory(), 'gate', 'cave')).toBe(true);
		expect(canLeadTo(createStory(), 'cave', 'left-end')).toBe(true);
	});

	test('rejects the node itself, a start node and a missing node', () => {
		expect(canLeadTo(createStory(), 'cave', 'cave')).toBe(false);
		expect(canLeadTo(createStory(), 'cave', 'start')).toBe(false);
		expect(canLeadTo(createStory(), 'cave', 'unknown')).toBe(false);
	});
});

describe('updateNodeAndExits', () => {
	test('removes the Continue edge when a linear scene gets choices', () => {
		const story = updateNodeAndExits(createStory(), 'cave', {
			type: 'scene',
			choices: [{ id: 'light-torch', label: 'Light a torch' }],
		});

		expect(story.edges.some((edge) => edge.source === 'cave')).toBe(false);
		expect(validateStory(story)).toContainEqual({
			code: 'missing-choice-edge',
			severity: 'error',
			nodeId: 'cave',
			choiceId: 'light-torch',
		});
	});

	test('keeps edges when choices do not change', () => {
		const story = updateNodeAndExits(createStory(), 'cave', { type: 'scene', title: 'Deep Cave' });

		expect(story.edges).toEqual(createStory().edges);
	});

	test('removing all choices removes their edges and leaves a dead end', () => {
		const story = updateNodeAndExits(createStory(), 'gate', { type: 'scene', choices: [] });

		expect(story.edges.some((edge) => edge.source === 'gate')).toBe(false);
		expect(validateStory(story)).toContainEqual({ code: 'dead-end', severity: 'error', nodeId: 'gate' });
	});
});
