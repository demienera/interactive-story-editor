import clsx from 'clsx';
import { useId } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import styles from './NodePanel.module.scss';

type FormFieldProps = {
	label: string;
	registration: UseFormRegisterReturn;
	error?: string;
	multiline?: boolean;
};

export function FormField({ label, registration, error, multiline = false }: FormFieldProps) {
	const id = useId();
	const errorId = `${id}-error`;
	const controlProps = {
		id,
		className: clsx(styles.control, { [styles.multiline]: multiline }),
		'aria-invalid': error ? true : undefined,
		'aria-describedby': error ? errorId : undefined,
		...registration,
	};

	return (
		<div className={styles.field}>
			<label
				htmlFor={id}
				className={styles.label}
			>
				{label}
			</label>
			{multiline ? (
				<textarea
					rows={6}
					{...controlProps}
				/>
			) : (
				<input
					type='text'
					{...controlProps}
				/>
			)}
			{error && (
				<p
					id={errorId}
					className={styles.error}
				>
					{error}
				</p>
			)}
		</div>
	);
}
