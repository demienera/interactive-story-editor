'use client';

import clsx from 'clsx';
import { createEmptyStory } from '../lib/story-factory';
import { useOpenInEditor } from '../lib/use-open-in-editor';
import styles from './StoryLibrary.module.scss';

export function NewStoryButton() {
	const { open, failed } = useOpenInEditor();

	return (
		<>
			<button
				type='button'
				className={clsx(styles.action, styles.primaryAction)}
				onClick={() => open(createEmptyStory(crypto.randomUUID(), crypto.randomUUID()))}
			>
				New story
			</button>
			{failed && (
				<p
					role='alert'
					className={styles.error}
				>
					Could not create a story: browser storage is unavailable or full.
				</p>
			)}
		</>
	);
}
