import { describe, expect, test } from 'vitest';
import { demoStory } from '@/entities/story/data/demo-story';
import type { Story } from '@/entities/story/model/types';
import { layoutByDepth } from './auto-layout';
import { storyToFlow } from './story-to-flow';

describe('storyToFlow', () => {
	const layout = layoutByDepth(demoStory);

	test('converts story nodes to flow nodes with the domain node as data', () => {
		const { nodes } = storyToFlow(demoStory, layout);

		expect(nodes).toHaveLength(demoStory.nodes.length);
		expect(nodes[0]).toMatchObject({ id: 'start', type: 'start', data: { node: demoStory.nodes[0] } });
	});

	test('uses the domain node type as the flow node type', () => {
		const { nodes } = storyToFlow(demoStory, layout);

		expect(nodes.map((node) => node.type)).toEqual(demoStory.nodes.map((node) => node.type));
	});

	test('describes nodes with an accessible label', () => {
		const { nodes } = storyToFlow(demoStory, layout);

		expect(nodes.find((node) => node.id === 'forest')?.ariaLabel).toBe('Scene: The Forest, 2 choices');
		expect(nodes.find((node) => node.id === 'whisper')?.ariaLabel).toBe('Scene: The Whisper');
		expect(nodes.find((node) => node.id === 'old-cabin')?.ariaLabel).toBe('Ending: The Old Cabin');
	});

	test('converts continue edges without a source handle', () => {
		const { edges } = storyToFlow(demoStory, layout);

		expect(edges).toHaveLength(demoStory.edges.length);
		expect(edges).toContainEqual({
			id: 'start-to-forest',
			source: 'start',
			target: 'forest',
			ariaLabel: 'Continue from Start to The Forest',
		});
	});

	test('connects choice edges to the handle of their choice', () => {
		const { edges } = storyToFlow(demoStory, layout);

		expect(edges.find((edge) => edge.id === 'forest-to-whisper')).toMatchObject({
			source: 'forest',
			target: 'whisper',
			sourceHandle: 'follow-whisper',
		});
	});

	test('describes choice edges with the choice label and node titles', () => {
		const { edges } = storyToFlow(demoStory, layout);

		expect(edges.find((edge) => edge.id === 'forest-to-whisper')?.ariaLabel).toBe(
			'Choice "Follow the whisper" from The Forest to The Whisper',
		);
	});

	test('falls back to the choice id when the choice does not exist', () => {
		const story: Story = {
			...demoStory,
			edges: [{ id: 'broken', type: 'choice', source: 'forest', target: 'whisper', choiceId: 'missing' }],
		};

		const { edges } = storyToFlow(story, layout);

		expect(edges[0]?.ariaLabel).toContain('"missing"');
	});

	test('takes node positions from the layout', () => {
		const { nodes } = storyToFlow(demoStory, { start: { x: 10, y: 20 } });

		expect(nodes.find((node) => node.id === 'start')?.position).toEqual({ x: 10, y: 20 });
	});
});
