import styles from './page.module.scss';

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.intro}>
					<h1>Interactive Story Editor</h1>
					<p>Create and explore branching stories.</p>
					<button>Create story</button>
				</div>
			</main>
		</div>
	);
}
