import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Story } from '@/entities/story/model/types';
import defaultCover from '../../../../public/bg.jpg';
import { getStoryCover } from '../lib/story-cover';
import { getStoryStats } from '../lib/story-stats';
import styles from './StoryLibrary.module.scss';

type StoryCardProps = {
	story: Story;
	children: ReactNode;
};

export function StoryCard({ story, children }: StoryCardProps) {
	return (
		<article className={styles.card}>
			<div className={styles.cover}>
				<Image
					src={getStoryCover(story) ?? defaultCover}
					alt=''
					fill
					sizes={'100%'}
					className={styles.coverImage}
				/>
			</div>
			<div className={styles.body}>
				<h3 className={styles.title}>{story.title}</h3>
				{story.description && <p className={styles.description}>{story.description}</p>}
				<p className={styles.stats}>{getStoryStats(story)}</p>
				<div className={styles.actions}>{children}</div>
			</div>
		</article>
	);
}
