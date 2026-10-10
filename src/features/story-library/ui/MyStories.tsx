'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import { deleteStory } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';
import { useEntries } from '../lib/use-story-library';
import { DeleteStoryDialog } from './DeleteStoryDialog';
import { NewStoryButton } from './NewStoryButton';
import { StoryCard } from './StoryCard';
import styles from './StoryLibrary.module.scss';

type MyStoriesProps = {
	onDeleted: () => void;
};

export function MyStories({ onDeleted }: MyStoriesProps) {
	const entries = useEntries();
	const [statusMessage, setStatusMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

	const handleDelete = (story: Story) => {
		setStoryToDelete(null);

		if (!deleteStory(story.id)) {
			setErrorMessage(`Could not delete "${story.title}": browser storage is unavailable.`);
			return;
		}

		setErrorMessage('');
		setStatusMessage(`"${story.title}" deleted`);
		onDeleted();
	};

	return (
		<>
			<p
				role='status'
				className={styles.visuallyHidden}
			>
				{statusMessage}
			</p>
			{errorMessage && (
				<p
					role='alert'
					className={styles.error}
				>
					{errorMessage}
				</p>
			)}
			{entries?.length === 0 && (
				<div className={styles.empty}>
					<p className={styles.emptyTitle}>No stories yet</p>
					<p className={styles.emptyText}>Start a new story from scratch, or edit a copy of one of the examples.</p>
					<div className={styles.emptyActions}>
						<NewStoryButton />
					</div>
				</div>
			)}
			{entries && entries.length > 0 && (
				<ul className={styles.list}>
					{entries.map(({ story }) => (
						<li key={story.id}>
							<StoryCard story={story}>
								<Link
									href={`/editor/${story.id}`}
									className={clsx(styles.action, styles.primaryAction)}
									aria-label={`Edit ${story.title}`}
								>
									Edit
								</Link>
								<Link
									href={`/play/${story.id}`}
									className={styles.action}
									aria-label={`Play ${story.title}`}
								>
									Play
								</Link>
								<button
									type='button'
									className={styles.deleteAction}
									aria-label={`Delete ${story.title}`}
									onClick={() => setStoryToDelete(story)}
								>
									Delete
								</button>
							</StoryCard>
						</li>
					))}
				</ul>
			)}
			{storyToDelete && (
				<DeleteStoryDialog
					story={storyToDelete}
					onConfirm={() => handleDelete(storyToDelete)}
					onCancel={() => setStoryToDelete(null)}
				/>
			)}
		</>
	);
}
