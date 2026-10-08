import clsx from 'clsx';
import Link from 'next/link';
import { exampleStories } from '@/entities/story/data/example-stories';
import { EditCopyButton } from './EditCopyButton';
import { StoryCard } from './StoryCard';
import styles from './StoryLibrary.module.scss';

export function ExampleStories() {
	return (
		<section
			className={styles.section}
			aria-labelledby='examples-heading'
		>
			<h2
				id='examples-heading'
				className={styles.heading}
			>
				Example stories
			</h2>
			<ul className={styles.list}>
				{exampleStories.map((story) => (
					<li key={story.id}>
						<StoryCard story={story}>
							<Link
								href={`/play/${story.id}`}
								className={clsx(styles.action, styles.primaryAction)}
								aria-label={`Play ${story.title}`}
							>
								Play
							</Link>
							<EditCopyButton story={story} />
						</StoryCard>
					</li>
				))}
			</ul>
		</section>
	);
}
