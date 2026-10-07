import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import { StoryEditor } from '@/features/story-editor/ui/StoryEditor';

export default function EditorPage() {
	return <StoryEditor initialStory={whisperingForest} />;
}
