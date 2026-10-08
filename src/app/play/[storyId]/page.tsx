import { exampleStories, getExampleStory } from '@/entities/story/data/example-stories';
import { StoryPlayer } from '@/features/story-player/ui/StoryPlayer';
import { UserStoryPlayer } from './UserStoryPlayer';

export function generateStaticParams() {
	return exampleStories.map((story) => ({ storyId: story.id }));
}

export default async function PlayPage({ params }: PageProps<'/play/[storyId]'>) {
	const { storyId } = await params;
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
