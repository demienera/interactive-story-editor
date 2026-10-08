'use client';

import { useState } from 'react';
import { saveStory, type StoryLayout } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';
import { StoryEditor } from '@/features/story-editor/ui/StoryEditor';
import { useStory } from '@/features/story-library/lib/use-story-library';
import { StoryLookupMessage } from '@/features/story-library/ui/StoryLookupMessage';
import styles from './EditorPage.module.scss';

type EditorPageProps = {
	storyId: string;
};

export function EditorPage({ storyId }: EditorPageProps) {
	const lookup = useStory(storyId);
	const [saveFailed, setSaveFailed] = useState(false);

	if (lookup.status !== 'ready') {
		return <StoryLookupMessage status={lookup.status} />;
	}

	const handleChange = (story: Story, layout: StoryLayout) => {
		setSaveFailed(!saveStory(story, layout));
	};

	return (
		<>
			<StoryEditor
				key={storyId}
				initialStory={lookup.story}
				initialLayout={lookup.layout}
				onChange={handleChange}
			/>
			{saveFailed && (
				<p
					role='alert'
					className={styles.saveError}
				>
					Changes are not saved: browser storage is unavailable or full.
				</p>
			)}
		</>
	);
}
