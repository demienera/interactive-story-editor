'use client';

import { useStory } from '@/features/story-library/lib/use-story-library';
import { StoryLookupMessage } from '@/features/story-library/ui/StoryLookupMessage';
import { StoryPlayer } from '@/features/story-player/ui/StoryPlayer';

type UserStoryPlayerProps = {
	storyId: string;
};

export function UserStoryPlayer({ storyId }: UserStoryPlayerProps) {
	const lookup = useStory(storyId);

	if (lookup.status !== 'ready') {
		return <StoryLookupMessage status={lookup.status} />;
	}

	return (
		<StoryPlayer
			key={storyId}
			story={lookup.story}
		/>
	);
}
