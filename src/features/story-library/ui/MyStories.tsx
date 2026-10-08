'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { deleteStory } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';
import { useStories } from '../lib/use-story-library';
import { StoryCard } from './StoryCard';
import styles from './StoryLibrary.module.scss';

export function MyStories() {
	const stories = useStories();
	const [statusMessage, setStatusMessage] = useState('');
	const headingRef = useRef<HTMLHeadingElement>(null);

	const handleDelete = (story: Story) => {
		if (!window.confirm(`Delete "${story.title}"? This cannot be undone.`)) {
			return;
		}

		if (!deleteStory(story.id)) {
			setStatusMessage(`Could not delete "${story.title}": browser storage is unavailable.`);
			return;
		}

		headingRef.current?.focus();
		setStatusMessage(`"${story.title}" deleted`);
	};

	return (
		<section
			className={styles.section}
			aria-labelledby='my-stories-heading'
		>
			<h2
				ref={headingRef}
				id='my-stories-heading'
				className={styles.heading}
				tabIndex={-1}
			>
				My stories
			</h2>
			<p
				role='status'
				className={styles.message}
			>
				{statusMessage}
			</p>
			{stories?.length === 0 && (
				<p className={styles.message}>No stories yet. Start a new story or edit a copy of an example.</p>
			)}
			{stories && stories.length > 0 && (
				<ul className={styles.list}>
					{stories.map((story) => (
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
									className={clsx(styles.action, styles.dangerAction)}
									aria-label={`Delete ${story.title}`}
									onClick={() => handleDelete(story)}
								>
									Delete
								</button>
							</StoryCard>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
