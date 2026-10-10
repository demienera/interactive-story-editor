'use client';

import clsx from 'clsx';
import { useEffect, useId, useRef, type MouseEvent } from 'react';
import type { Story } from '@/entities/story/model/types';
import styles from './StoryLibrary.module.scss';

const CONFIRM = 'delete';

type DeleteStoryDialogProps = {
	story: Story;
	onConfirm: () => void;
	onCancel: () => void;
};

export function DeleteStoryDialog({ story, onConfirm, onCancel }: DeleteStoryDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);
	const titleId = useId();
	const descriptionId = useId();

	useEffect(() => {
		const dialog = dialogRef.current;

		if (dialog && !dialog.open) {
			dialog.showModal();
			cancelRef.current?.focus();
		}
	}, []);

	const close = (value: string) => dialogRef.current?.close(value);

	const handleClose = () => {
		if (dialogRef.current?.returnValue === CONFIRM) {
			onConfirm();
		} else {
			onCancel();
		}
	};

	const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
		if (event.target === event.currentTarget) {
			close('cancel');
		}
	};

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			onClose={handleClose}
			onClick={handleBackdropClick}
		>
			<h2
				id={titleId}
				className={styles.dialogTitle}
			>
				Delete story?
			</h2>
			<p
				id={descriptionId}
				className={styles.dialogText}
			>
				&quot;{story.title}&quot; will be deleted from this browser. This cannot be undone.
			</p>
			<div className={styles.dialogActions}>
				<button
					type='button'
					ref={cancelRef}
					className={styles.action}
					onClick={() => close('cancel')}
				>
					Cancel
				</button>
				<button
					type='button'
					className={clsx(styles.action, styles.dangerAction)}
					onClick={() => close(CONFIRM)}
				>
					Delete
				</button>
			</div>
		</dialog>
	);
}
