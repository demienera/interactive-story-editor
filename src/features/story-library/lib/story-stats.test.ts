import { describe, expect, test } from 'vitest';
import { createEmptyStory } from './story-factory';
import { getStoryStats } from './story-stats';

describe('getStoryStats', () => {
	test('counts scenes and endings', () => {
		const story = createEmptyStory('story-1', 'start-1');

		expect(
			getStoryStats({
				...story,
				nodes: [
					...story.nodes,
					{ id: 'scene-1', type: 'scene', title: 'One', text: '', choices: [] },
					{ id: 'scene-2', type: 'scene', title: 'Two', text: '', choices: [] },
					{ id: 'ending-1', type: 'ending', title: 'End', text: '' },
				],
			}),
		).toBe('2 scenes · 1 ending');
	});

	test('uses the plural for zero', () => {
		expect(getStoryStats(createEmptyStory('story-1', 'start-1'))).toBe('0 scenes · 0 endings');
	});
});
