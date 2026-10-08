import Link from 'next/link';
import styles from './StoryLibrary.module.scss';

type StoryLookupMessageProps = {
	status: 'loading' | 'not-found';
};

export function StoryLookupMessage({ status }: StoryLookupMessageProps) {
	if (status === 'loading') {
		return (
			<main className={styles.lookup}>
				<p className={styles.message}>Loading story…</p>
			</main>
		);
	}

	return (
		<main className={styles.lookup}>
			<h1 className={styles.lookupTitle}>Story not found</h1>
			<p className={styles.message}>It may have been deleted, or it was saved in another browser.</p>
			<Link href='/'>Back to home</Link>
		</main>
	);
}
