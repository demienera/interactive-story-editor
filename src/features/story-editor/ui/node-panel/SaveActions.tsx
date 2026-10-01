import styles from './NodePanel.module.scss';

type SaveActionsProps = {
	saved: boolean;
};

export function SaveActions({ saved }: SaveActionsProps) {
	return (
		<div className={styles.actions}>
			<button
				type='submit'
				className={styles.save}
			>
				Save
			</button>
			<p
				role='status'
				className={styles.status}
			>
				{saved ? 'Changes saved' : ''}
			</p>
		</div>
	);
}
