import Image from 'next/image';
import { LibraryTabs } from '@/features/story-library/ui/LibraryTabs';
import mainBackground from '../../../../public/main-bg.png';
import styles from './HomePage.module.scss';

export function HomePage() {
	return (
		<div className={styles.page}>
			<div className={styles.hero}>
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
				<header className={styles.intro}>
					<h1 className={styles.title}>Interactive Story Editor</h1>
					<p className={styles.tagline}>
						Build branching stories on a visual graph, then play them like a visual novel.
					</p>
				</header>
			</div>

			<main className={styles.main}>
				<LibraryTabs />
			</main>
		</div>
	);
}
