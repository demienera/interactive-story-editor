'use client';

import type { Story } from '@/entities/story/model/types';
import { copyStory } from '../lib/story-factory';
import { useOpenInEditor } from '../lib/use-open-in-editor';
import styles from './StoryLibrary.module.scss';

type EditCopyButtonProps = {
	story: Story;
};

export function EditCopyButton({ story }: EditCopyButtonProps) {
	const { open, failed } = useOpenInEditor();

	return (
		<>
			<button
				type='button'
				className={styles.action}
				aria-label={`Edit a copy of ${story.title}`}
				onClick={() => open(copyStory(story, crypto.randomUUID()))}
			>
				Edit a copy
			</button>
			{failed && (
				<p
					role='alert'
					className={styles.error}
				>
					Could not copy the story: browser storage is unavailable or full.
				</p>
			)}
		</>
	);
}
