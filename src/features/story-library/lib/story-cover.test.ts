import { describe, expect, test } from 'vitest';
import { getBackground } from '@/entities/story/data/backgrounds';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import type { Story } from '@/entities/story/model/types';
import { getStoryCover } from './story-cover';

function withStartBackground(background: string | undefined): Story {
	return {
		...whisperingForest,
		nodes: whisperingForest.nodes.map((node) => (node.type === 'start' ? { ...node, background } : node)),
	};
}

describe('getStoryCover', () => {
	test('uses the background of the start node', () => {
		expect(getStoryCover(withStartBackground('forest-shrine'))).toBe(getBackground('forest-shrine')?.src);
	});

	test('returns undefined when the start node has no background or an unknown one', () => {
		expect(getStoryCover(withStartBackground(undefined))).toBeUndefined();
		expect(getStoryCover(withStartBackground('removed-image'))).toBeUndefined();
	});

	test('returns undefined for a story without a start node', () => {
		expect(getStoryCover({ ...whisperingForest, nodes: [] })).toBeUndefined();
	});
});
