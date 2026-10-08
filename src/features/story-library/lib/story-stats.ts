import type { Story, StoryNodeType } from '@/entities/story/model/types';

function countNodes(story: Story, type: StoryNodeType, word: string): string {
	const count = story.nodes.filter((node) => node.type === type).length;

	return `${count} ${count === 1 ? word : `${word}s`}`;
}

export function getStoryStats(story: Story): string {
	return `${countNodes(story, 'scene', 'scene')} · ${countNodes(story, 'ending', 'ending')}`;
}
