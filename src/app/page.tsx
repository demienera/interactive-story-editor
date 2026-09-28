import Link from 'next/link';
import styles from './page.module.scss';

export default function Home() {
	return (
		<div className={styles.page}>
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
