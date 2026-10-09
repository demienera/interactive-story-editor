import { describe, expect, test } from 'vitest';
import { whisperingForest } from '../data/examples/whispering-forest';
import { addNode } from './story-operations';
import type { Story, StoryEdge, StoryNode } from './types';
import { validateStory } from './validate-story';

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

function withNodes(story: Story, nodes: StoryNode[]): Story {
	return { ...story, nodes: [...story.nodes, ...nodes] };
}

function withEdges(story: Story, edges: StoryEdge[]): Story {
	return { ...story, edges: [...story.edges, ...edges] };
}

function withoutEdge(story: Story, edgeId: string): Story {
	return { ...story, edges: story.edges.filter((edge) => edge.id !== edgeId) };
}

describe('validateStory', () => {
	test('returns no issues for a valid story', () => {
		expect(validateStory(createStory())).toEqual([]);
	});

	test('returns no issues for the demo story', () => {
		expect(validateStory(whisperingForest)).toEqual([]);
	});

	describe('start node', () => {
		test('reports a missing start node without reporting every node as unreachable', () => {
			const story = createStory();
			const result = validateStory({
				...story,
				nodes: story.nodes.filter((node) => node.id !== 'start'),
				edges: story.edges.filter((edge) => edge.source !== 'start'),
			});

			expect(result).toEqual([{ code: 'missing-start', severity: 'error' }]);
		});

		test('reports multiple start nodes', () => {
			const story = withEdges(withNodes(createStory(), [{ id: 'start-2', type: 'start', title: 'Start 2' }]), [
				{ id: 'start-2-to-gate', type: 'continue', source: 'start-2', target: 'gate' },
			]);

			expect(validateStory(story)).toEqual([
				{ code: 'multiple-starts', severity: 'error', nodeIds: ['start', 'start-2'] },
			]);
		});
	});

	describe('exits', () => {
		test('reports a start node without a continue edge', () => {
			const result = validateStory(withoutEdge(createStory(), 'start-to-gate'));

			expect(result).toContainEqual({ code: 'dead-end', severity: 'error', nodeId: 'start' });
		});

		test('reports a linear scene without a continue edge', () => {
			const story = withEdges(
				withNodes(createStory(), [{ id: 'cave', type: 'scene', title: 'Cave', text: '', choices: [] }]),
				[{ id: 'cave-in', type: 'continue', source: 'start', target: 'cave' }],
			);

			expect(validateStory(story)).toContainEqual({ code: 'dead-end', severity: 'error', nodeId: 'cave' });
		});

		test('reports a choice without an edge', () => {
			const result = validateStory(withoutEdge(createStory(), 'gate-right'));

			expect(result).toContainEqual({
				code: 'missing-choice-edge',
				severity: 'error',
				nodeId: 'gate',
				choiceId: 'go-right',
			});
		});

		test('does not require exits from an ending', () => {
			const result = validateStory(createStory());

			expect(result.some((issue) => issue.code === 'dead-end')).toBe(false);
		});
	});

	describe('edges', () => {
		test('reports an edge to a missing node', () => {
			const story = withEdges(withoutEdge(createStory(), 'gate-left'), [
				{ id: 'gate-left', type: 'choice', source: 'gate', target: 'nowhere', choiceId: 'go-left' },
			]);

			expect(validateStory(story)).toEqual([
				{ code: 'missing-node', severity: 'error', edgeId: 'gate-left', nodeId: 'nowhere' },
				{ code: 'unreachable-node', severity: 'warning', nodeId: 'left-end' },
			]);
		});

		test('reports an edge from a missing node', () => {
			const story = withEdges(createStory(), [{ id: 'ghost', type: 'continue', source: 'nowhere', target: 'gate' }]);

			expect(validateStory(story)).toEqual([
				{ code: 'missing-node', severity: 'error', edgeId: 'ghost', nodeId: 'nowhere' },
			]);
		});

		test('reports a choice edge with an unknown choice', () => {
			const story = withEdges(createStory(), [
				{ id: 'gate-up', type: 'choice', source: 'gate', target: 'left-end', choiceId: 'go-up' },
			]);

			expect(validateStory(story)).toEqual([
				{ code: 'unknown-choice', severity: 'error', edgeId: 'gate-up', choiceId: 'go-up' },
			]);
		});

		test('reports a choice edge that does not start from a scene', () => {
			const story = withEdges(createStory(), [
				{ id: 'start-choice', type: 'choice', source: 'start', target: 'gate', choiceId: 'go-left' },
			]);

			expect(validateStory(story)).toEqual([
				{ code: 'unknown-choice', severity: 'error', edgeId: 'start-choice', choiceId: 'go-left' },
			]);
		});
	});

	describe('ignored edges', () => {
		test('reports a continue edge from a scene with choices', () => {
			const story = withEdges(createStory(), [
				{ id: 'gate-continue', type: 'continue', source: 'gate', target: 'left-end' },
			]);

			expect(validateStory(story)).toEqual([{ code: 'ignored-edge', severity: 'warning', edgeId: 'gate-continue' }]);
		});

		test('reports an edge from an ending', () => {
			const story = withEdges(createStory(), [
				{ id: 'after-end', type: 'continue', source: 'left-end', target: 'right-end' },
			]);

			expect(validateStory(story)).toEqual([{ code: 'ignored-edge', severity: 'warning', edgeId: 'after-end' }]);
		});

		test('reports a second continue edge from the same node', () => {
			const story = withEdges(createStory(), [
				{ id: 'start-to-end', type: 'continue', source: 'start', target: 'left-end' },
			]);

			expect(validateStory(story)).toEqual([{ code: 'ignored-edge', severity: 'warning', edgeId: 'start-to-end' }]);
		});

		test('reports a second edge for the same choice', () => {
			const story = withEdges(createStory(), [
				{ id: 'gate-left-2', type: 'choice', source: 'gate', target: 'right-end', choiceId: 'go-left' },
			]);

			expect(validateStory(story)).toEqual([{ code: 'ignored-edge', severity: 'warning', edgeId: 'gate-left-2' }]);
		});
	});

	describe('reachability', () => {
		test('reports a node that cannot be reached from the start', () => {
			const story = withNodes(createStory(), [{ id: 'lost-end', type: 'ending', title: 'Lost', text: '' }]);

			expect(validateStory(story)).toEqual([{ code: 'unreachable-node', severity: 'warning', nodeId: 'lost-end' }]);
		});

		test('a scene added by an operation is allowed but reported until it is connected', () => {
			const story = addNode(createStory(), { id: 'cave', type: 'scene', title: 'Cave', text: '', choices: [] });

			expect(validateStory(story)).toEqual([
				{ code: 'dead-end', severity: 'error', nodeId: 'cave' },
				{ code: 'unreachable-node', severity: 'warning', nodeId: 'cave' },
			]);
		});
	});

	describe('backgrounds', () => {
		const known = new Set(['forest']);

		function withBackgrounds(gate: string | undefined, leftEnd: string | undefined): Story {
			const story = createStory();

			return {
				...story,
				nodes: story.nodes.map((node) => {
					if (node.id === 'gate' && node.type === 'scene') {
						return { ...node, background: gate };
					}

					return node.id === 'left-end' && node.type === 'ending' ? { ...node, background: leftEnd } : node;
				}),
			};
		}

		test('accepts known backgrounds and nodes without a background', () => {
			expect(validateStory(withBackgrounds('forest', undefined), known)).toEqual([]);
		});

		test('reports a background that is not in the known list', () => {
			expect(validateStory(withBackgrounds('forest', 'old-cave'), known)).toEqual([
				{ code: 'unknown-background', severity: 'warning', nodeId: 'left-end', background: 'old-cave' },
			]);
		});

		test('checks the start node too', () => {
			const story = createStory();
			const withStartBackground: Story = {
				...story,
				nodes: story.nodes.map((node) => (node.type === 'start' ? { ...node, background: 'old-cave' } : node)),
			};

			expect(validateStory(withStartBackground, known)).toEqual([
				{ code: 'unknown-background', severity: 'warning', nodeId: 'start', background: 'old-cave' },
			]);
		});

		test('skips the check when known backgrounds are not passed', () => {
			expect(validateStory(withBackgrounds('old-cave', 'old-cave'))).toEqual([]);
		});
	});
});
