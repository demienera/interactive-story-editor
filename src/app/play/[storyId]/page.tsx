import { exampleStories } from '@/entities/story/data/example-stories';
import { PlayPage } from '@/views/play/ui/PlayPage';

export function generateStaticParams() {
	return exampleStories.map((story) => ({ storyId: story.id }));
}

export default async function PlayRoute({ params }: PageProps<'/play/[storyId]'>) {
	const { storyId } = await params;

	return <PlayPage storyId={storyId} />;
}
