import { describe, expect, test } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import type { Story } from '@/entities/story/model/types';
import { completeLayout, layoutByDepth } from './auto-layout';

describe('layoutByDepth', () => {
	test('creates a position for every node', () => {
		const layout = layoutByDepth(whisperingForest);

		expect(Object.keys(layout)).toHaveLength(whisperingForest.nodes.length);
	});

	test('places nodes on levels by distance from the start node', () => {
		const layout = layoutByDepth(whisperingForest);

		expect(layout.start?.y).toBeLessThan(layout.forest?.y ?? 0);
		expect(layout.forest?.y).toBeLessThan(layout.whisper?.y ?? 0);
		expect(layout.whisper?.y).toBeLessThan(layout['mysterious-shrine']?.y ?? 0);
	});

	test('places sibling branches on the same level side by side', () => {
		const layout = layoutByDepth(whisperingForest);

		expect(layout.whisper?.y).toBe(layout.shelter?.y);
		expect(layout.whisper?.x).not.toBe(layout.shelter?.x);
	});

	test('places unreachable nodes below all reachable levels', () => {
		const story: Story = {
			...whisperingForest,
			nodes: [...whisperingForest.nodes, { id: 'orphan', type: 'ending', title: 'Orphan', text: '' }],
		};

		const layout = layoutByDepth(story);
		const reachableYs = whisperingForest.nodes.map((node) => layout[node.id]?.y ?? 0);

		expect(layout.orphan?.y).toBeGreaterThan(Math.max(...reachableYs));
	});
});

describe('completeLayout', () => {
	test('uses the automatic layout when nothing is saved', () => {
		expect(completeLayout(whisperingForest, {})).toEqual(layoutByDepth(whisperingForest));
	});

	test('keeps saved positions and fills in the missing ones', () => {
		const layout = completeLayout(whisperingForest, { forest: { x: 500, y: -40 } });

		expect(layout.forest).toEqual({ x: 500, y: -40 });
		expect(layout.start).toEqual(layoutByDepth(whisperingForest).start);
		expect(Object.keys(layout)).toHaveLength(whisperingForest.nodes.length);
	});
});
