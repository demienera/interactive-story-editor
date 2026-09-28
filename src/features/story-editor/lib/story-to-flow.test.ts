import { describe, expect, test } from 'vitest';
import { demoStory } from '@/entities/story/data/demo-story';
import type { Story } from '@/entities/story/model/types';
import { layoutByDepth } from './auto-layout';
import { storyToFlow } from './story-to-flow';

describe('storyToFlow', () => {
	const layout = layoutByDepth(demoStory);

	test('converts story nodes to flow nodes', () => {
		const { nodes } = storyToFlow(demoStory, layout);

		expect(nodes).toHaveLength(demoStory.nodes.length);
		expect(nodes[0]).toMatchObject({ id: 'start', data: { label: 'Start', nodeType: 'start' } });
	});

	test('converts continue edges to flow edges without a label', () => {
		const { edges } = storyToFlow(demoStory, layout);

		expect(edges).toHaveLength(demoStory.edges.length);
		expect(edges).toContainEqual({ id: 'start-to-forest', source: 'start', target: 'forest' });
	});

	test('labels choice edges with the choice label', () => {
		const { edges } = storyToFlow(demoStory, layout);

		expect(edges).toContainEqual({
			id: 'forest-to-whisper',
			source: 'forest',
			target: 'whisper',
			label: 'Follow the whisper',
		});
	});

	test('falls back to the choice id when the choice does not exist', () => {
		const story: Story = {
			...demoStory,
			edges: [{ id: 'broken', type: 'choice', source: 'forest', target: 'whisper', choiceId: 'missing' }],
		};

		const { edges } = storyToFlow(story, layout);

		expect(edges[0]?.label).toBe('missing');
	});

	test('takes node positions from the layout', () => {
		const { nodes } = storyToFlow(demoStory, { start: { x: 10, y: 20 } });

		expect(nodes.find((node) => node.id === 'start')?.position).toEqual({ x: 10, y: 20 });
	});
});
