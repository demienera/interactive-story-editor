import Image from 'next/image';
import Link from 'next/link';
import mainBackground from '../../public/main-bg.png';
import styles from './page.module.scss';

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
						<Link href='/play'>Play demo story</Link>
						<Link href='/editor'>Open editor</Link>
					</nav>
				</div>
			</main>
		</div>
	);
}
