import Image from 'next/image';
import Link from 'next/link';
import { exampleStories } from '@/entities/story/data/example-stories';
import type { Story, StoryNodeType } from '@/entities/story/model/types';
import mainBackground from '../../public/main-bg.png';
import styles from './page.module.scss';

function countNodes(story: Story, type: StoryNodeType, word: string): string {
	const count = story.nodes.filter((node) => node.type === type).length;

	return `${count} ${count === 1 ? word : `${word}s`}`;
}

export default function Home() {
	return (
		<div className={styles.page}>
			<Image
				src={mainBackground}
				alt=''
				fill
				priority
				quality={90}
				placeholder='blur'
				sizes='100vw'
				className={styles.background}
			/>
			<main className={styles.main}>
				<div className={styles.intro}>
					<h1>Interactive Story Editor</h1>
					<p>Create and explore branching stories.</p>
					<nav
						aria-label='Main'
						className={styles.actions}
					>
						<Link href='/editor'>Open editor</Link>
					</nav>
				</div>

				<section
					className={styles.examples}
					aria-labelledby='examples-heading'
				>
					<h2
						id='examples-heading'
						className={styles.examplesHeading}
					>
						Example stories
					</h2>
					<ul className={styles.storyList}>
						{exampleStories.map((story) => (
							<li key={story.id}>
								<article className={styles.storyCard}>
									<h3 className={styles.storyTitle}>{story.title}</h3>
									<p className={styles.storyDescription}>{story.description}</p>
									<p className={styles.storyStats}>
										{countNodes(story, 'scene', 'scene')} · {countNodes(story, 'ending', 'ending')}
									</p>
									<Link
										href={`/play/${story.id}`}
										className={styles.playLink}
										aria-label={`Play ${story.title}`}
									>
										Play
									</Link>
								</article>
							</li>
						))}
					</ul>
				</section>
			</main>
		</div>
	);
}
