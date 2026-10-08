import { useSyncExternalStore } from 'react';
import { getEntries, subscribe, type LibraryEntry, type StoryLayout } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';

export type StoryLookup =
	| { status: 'loading' }
	| { status: 'not-found' }
	| { status: 'ready'; story: Story; layout: StoryLayout };

const getServerEntries = () => null;

export function useEntries(): LibraryEntry[] | null {
	return useSyncExternalStore(subscribe, getEntries, getServerEntries);
}

export function useStory(id: string): StoryLookup {
	const entries = useEntries();

	if (!entries) {
		return { status: 'loading' };
	}

	const entry = entries.find((current) => current.story.id === id);

	return entry ? { status: 'ready', story: entry.story, layout: entry.layout } : { status: 'not-found' };
}
