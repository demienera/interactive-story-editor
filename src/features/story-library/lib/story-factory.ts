import type { Story } from '@/entities/story/model/types';

export function createEmptyStory(id: string, startNodeId: string): Story {
	return {
		id,
		title: 'Untitled story',
		description: '',
		nodes: [{ id: startNodeId, type: 'start', title: 'Start' }],
		edges: [],
	};
}

export function copyStory(story: Story, id: string): Story {
	return { ...story, id, title: `${story.title} (copy)` };
}
