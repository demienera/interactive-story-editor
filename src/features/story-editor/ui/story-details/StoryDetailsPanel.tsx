import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import type { StoryDetailsPatch } from '@/entities/story/model/story-operations';
import type { Story } from '@/entities/story/model/types';
import {
	storyDetailsSchema,
	toStoryDetailsPatch,
	toStoryDetailsValues,
	type StoryDetailsValues,
} from '../../lib/story-details-form';
import { FormField } from '../node-panel/FormField';
import { SaveActions } from '../node-panel/SaveActions';
import styles from './StoryDetailsPanel.module.scss';

type StoryDetailsPanelProps = {
	story: Story;
	formKey: number;
	onSave: (patch: StoryDetailsPatch) => void;
};

export function StoryDetailsPanel({ story, formKey, onSave }: StoryDetailsPanelProps) {
	const headingId = useId();

	return (
		<section
			className={styles.panel}
			aria-labelledby={headingId}
		>
			<h2
				id={headingId}
				className={styles.heading}
			>
				Story details
			</h2>
			<details className={styles.details}>
				<summary className={styles.toggle}>Edit title and description</summary>
				<StoryDetailsForm
					key={formKey}
					story={story}
					onSave={onSave}
				/>
			</details>
		</section>
	);
}

type StoryDetailsFormProps = {
	story: Story;
	onSave: (patch: StoryDetailsPatch) => void;
};

function StoryDetailsForm({ story, onSave }: StoryDetailsFormProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitSuccessful },
	} = useForm({
		resolver: zodResolver(storyDetailsSchema),
		defaultValues: toStoryDetailsValues(story),
	});

	const onSubmit = (values: StoryDetailsValues) => {
		onSave(toStoryDetailsPatch(values));
		reset(values);
	};

	return (
		<form
			className={styles.form}
			noValidate
			onSubmit={handleSubmit(onSubmit)}
		>
			<FormField
				label='Title'
				registration={register('title')}
				error={errors.title?.message}
			/>
			<FormField
				label='Description'
				registration={register('description')}
				error={errors.description?.message}
				multiline
			/>
			<SaveActions saved={isSubmitSuccessful && !isDirty} />
		</form>
	);
}
