import type { Story, StoryNode } from './types';

export function getNode(story: Story, nodeId: string): StoryNode | undefined {
	return story.nodes.find((node) => node.id === nodeId);
}

export function getStartNode(story: Story): StoryNode | undefined {
	return story.nodes.find((node) => node.type === 'start');
}

export function getNextNode(story: Story, nodeId: string): StoryNode | undefined {
	const edge = story.edges.find((edge) => edge.source === nodeId);

	if (!edge) {
		return undefined;
	}

	return getNode(story, edge.target);
}

export function getNextNodeByChoice(story: Story, nodeId: string, choiceId: string): StoryNode | undefined {
	const edge = story.edges.find((edge) => edge.source === nodeId && edge.choiceId === choiceId);

	if (!edge) {
		return undefined;
	}

	return getNode(story, edge.target);
}
