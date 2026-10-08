import Image from 'next/image';
import { ExampleStories } from '@/features/story-library/ui/ExampleStories';
import { MyStories } from '@/features/story-library/ui/MyStories';
import { NewStoryButton } from '@/features/story-library/ui/NewStoryButton';
import mainBackground from '../../../../public/main-bg.png';
import styles from './HomePage.module.scss';

export function HomePage() {
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
					<div className={styles.actions}>
						<NewStoryButton />
					</div>
				</div>

				<MyStories />
				<ExampleStories />
			</main>
		</div>
	);
}
