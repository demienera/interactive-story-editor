import { EditorPage } from '@/views/editor/ui/EditorPage';

export default async function EditorRoute({ params }: PageProps<'/editor/[storyId]'>) {
	const { storyId } = await params;

	return <EditorPage storyId={storyId} />;
}
