import { describe, expect, test } from 'vitest';
import { demoStory } from '@/entities/story/data/demo-story';
import type { Story } from '@/entities/story/model/types';
import { layoutByDepth } from './auto-layout';

describe('layoutByDepth', () => {
	test('creates a position for every node', () => {
		const layout = layoutByDepth(demoStory);

		expect(Object.keys(layout)).toHaveLength(demoStory.nodes.length);
	});

	test('places nodes on levels by distance from the start node', () => {
		const layout = layoutByDepth(demoStory);

		expect(layout.start?.y).toBeLessThan(layout.forest?.y ?? 0);
		expect(layout.forest?.y).toBeLessThan(layout.whisper?.y ?? 0);
		expect(layout.whisper?.y).toBeLessThan(layout['mysterious-shrine']?.y ?? 0);
	});

	test('places sibling branches on the same level side by side', () => {
		const layout = layoutByDepth(demoStory);

		expect(layout.whisper?.y).toBe(layout.shelter?.y);
		expect(layout.whisper?.x).not.toBe(layout.shelter?.x);
	});

	test('places unreachable nodes below all reachable levels', () => {
		const story: Story = {
			...demoStory,
			nodes: [...demoStory.nodes, { id: 'orphan', type: 'ending', title: 'Orphan', text: '' }],
		};

		const layout = layoutByDepth(story);
		const reachableYs = demoStory.nodes.map((node) => layout[node.id]?.y ?? 0);

		expect(layout.orphan?.y).toBeGreaterThan(Math.max(...reachableYs));
	});
});
