import { useSyncExternalStore } from 'react';
import { getStories, subscribe } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';

export type StoryLookup = { status: 'loading' } | { status: 'not-found' } | { status: 'ready'; story: Story };

const getServerStories = () => null;

export function useStories(): Story[] | null {
	return useSyncExternalStore(subscribe, getStories, getServerStories);
}

export function useStory(id: string): StoryLookup {
	const stories = useStories();

	if (!stories) {
		return { status: 'loading' };
	}

	const story = stories.find((current) => current.id === id);

	return story ? { status: 'ready', story } : { status: 'not-found' };
}
