import { getBackground } from '@/entities/story/data/backgrounds';
import { getNextNode, getNextNodeByChoice } from '@/entities/story/model/story-engine';
import type { Story, StoryNode } from '@/entities/story/model/types';

export const DEFAULT_BACKGROUND = 'default';

export type BackgroundLayer = {
	key: number;
	background: string;
};

export function getNodeBackground(node: StoryNode): string | undefined {
	if (!node.background) {
		return undefined;
	}

	return getBackground(node.background) ? node.background : undefined;
}

export function getSceneBackground(current: string, node: StoryNode): string {
	if (node.type === 'start') {
		return getNodeBackground(node) ?? DEFAULT_BACKGROUND;
	}

	return getNodeBackground(node) ?? current;
}

export function showBackground(layers: BackgroundLayer[], background: string): BackgroundLayer[] {
	const top = layers[layers.length - 1];

	if (!top) {
		return [{ key: 0, background }];
	}

	return top.background === background ? layers : [top, { key: top.key + 1, background }];
}

export function getUpcomingNodes(story: Story, node: StoryNode): StoryNode[] {
	if (node.type === 'ending') {
		return [];
	}

	const nextNodes =
		node.type === 'scene' && node.choices.length > 0
			? node.choices.map((choice) => getNextNodeByChoice(story, node.id, choice.id))
			: [getNextNode(story, node.id)];

	return nextNodes.filter((next) => next !== undefined);
}
