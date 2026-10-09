import { getBackground } from '@/entities/story/data/backgrounds';
import { getStartNode } from '@/entities/story/model/story-engine';
import type { Story } from '@/entities/story/model/types';

export function getStoryCover(story: Story): string | undefined {
	const background = getStartNode(story)?.background;

	return background ? getBackground(background)?.src : undefined;
}
