import Image from 'next/image';
import { useId } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { backgrounds, getBackground } from '@/entities/story/data/backgrounds';
import styles from './NodePanel.module.scss';

type BackgroundFieldProps = {
	registration: UseFormRegisterReturn;
	value: string;
};

export function BackgroundField({ registration, value }: BackgroundFieldProps) {
	const id = useId();
	const hintId = `${id}-hint`;
	const selected = getBackground(value);

	return (
		<div className={styles.field}>
			<label
				htmlFor={id}
				className={styles.label}
			>
				Background
			</label>
			<select
				id={id}
				className={styles.control}
				aria-describedby={hintId}
				{...registration}
			>
				<option value=''>Keep previous</option>
				{backgrounds.map((background) => (
					<option
						key={background.id}
						value={background.id}
					>
						{background.label}
					</option>
				))}
			</select>
			<p
				id={hintId}
				className={styles.hint}
			>
				The background stays until a later scene changes it.
			</p>
			{selected && (
				<Image
					src={selected.src}
					alt=''
					width={192}
					height={108}
					className={styles.preview}
				/>
			)}
		</div>
	);
}
