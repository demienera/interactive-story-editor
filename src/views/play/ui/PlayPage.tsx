import { getExampleStory } from '@/entities/story/data/example-stories';
import { StoryPlayer } from '@/features/story-player/ui/StoryPlayer';
import { UserStoryPlayer } from './UserStoryPlayer';

type PlayPageProps = {
	storyId: string;
};

export function PlayPage({ storyId }: PlayPageProps) {
	const story = getExampleStory(storyId);

	if (!story) {
		return <UserStoryPlayer storyId={storyId} />;
	}

	return (
		<StoryPlayer
			key={story.id}
			story={story}
		/>
	);
}
