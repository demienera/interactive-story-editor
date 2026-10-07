import { MarkerType } from '@xyflow/react';
import { describe, expect, test } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import type { Story } from '@/entities/story/model/types';
import { layoutByDepth } from './auto-layout';
import { storyToFlow } from './story-to-flow';

describe('storyToFlow', () => {
	const layout = layoutByDepth(whisperingForest);

	test('converts story nodes to flow nodes with the domain node as data', () => {
		const { nodes } = storyToFlow(whisperingForest, layout);

		expect(nodes).toHaveLength(whisperingForest.nodes.length);
		expect(nodes[0]).toMatchObject({ id: 'start', type: 'start', data: { node: whisperingForest.nodes[0] } });
	});

	test('uses the domain node type as the flow node type', () => {
		const { nodes } = storyToFlow(whisperingForest, layout);

		expect(nodes.map((node) => node.type)).toEqual(whisperingForest.nodes.map((node) => node.type));
	});

	test('describes nodes with an accessible label', () => {
		const { nodes } = storyToFlow(whisperingForest, layout);

		expect(nodes.find((node) => node.id === 'forest')?.ariaLabel).toBe('Scene: The Forest, 2 choices');
		expect(nodes.find((node) => node.id === 'whisper')?.ariaLabel).toBe('Scene: The Whisper');
		expect(nodes.find((node) => node.id === 'old-cabin')?.ariaLabel).toBe('Ending: The Old Cabin');
	});

	test('uses the singular for a scene with one choice', () => {
		const story: Story = {
			...whisperingForest,
			nodes: [{ id: 'gate', type: 'scene', title: 'The Gate', text: '', choices: [{ id: 'open', label: 'Open' }] }],
		};

		expect(storyToFlow(story, layout).nodes[0]?.ariaLabel).toBe('Scene: The Gate, 1 choice');
	});

	test('converts continue edges without a source handle', () => {
		const { edges } = storyToFlow(whisperingForest, layout);

		expect(edges).toHaveLength(whisperingForest.edges.length);
		expect(edges).toContainEqual({
			id: 'start-to-forest',
			source: 'start',
			target: 'forest',
			type: 'story',
			markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-edge)' },
			ariaLabel: 'Continue from Start to The Forest',
		});
	});

	test('connects choice edges to the handle of their choice', () => {
		const { edges } = storyToFlow(whisperingForest, layout);

		expect(edges.find((edge) => edge.id === 'forest-to-whisper')).toMatchObject({
			source: 'forest',
			target: 'whisper',
			sourceHandle: 'follow-whisper',
		});
	});

	test('describes choice edges with the choice label and node titles', () => {
		const { edges } = storyToFlow(whisperingForest, layout);

		expect(edges.find((edge) => edge.id === 'forest-to-whisper')?.ariaLabel).toBe(
			'Choice "Follow the whisper" from The Forest to The Whisper',
		);
	});

	test('falls back to the choice id when the choice does not exist', () => {
		const story: Story = {
			...whisperingForest,
			edges: [{ id: 'broken', type: 'choice', source: 'forest', target: 'whisper', choiceId: 'missing' }],
		};

		const { edges } = storyToFlow(story, layout);

		expect(edges[0]?.ariaLabel).toContain('"missing"');
	});

	test('takes node positions from the layout', () => {
		const { nodes } = storyToFlow(whisperingForest, { start: { x: 10, y: 20 } });

		expect(nodes.find((node) => node.id === 'start')?.position).toEqual({ x: 10, y: 20 });
	});
});
