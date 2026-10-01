import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { EndingNode } from '@/entities/story/model/types';
import { endingFormSchema, toEndingFormValues, toEndingPatch, type EndingFormValues } from '../../lib/node-form';
import { FormField } from './FormField';
import { SaveActions } from './SaveActions';
import styles from './NodePanel.module.scss';

type EndingNodeFormProps = {
	node: EndingNode;
	onSave: (patch: StoryNodePatch) => void;
};

export function EndingNodeForm({ node, onSave }: EndingNodeFormProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitSuccessful },
	} = useForm({
		resolver: zodResolver(endingFormSchema),
		defaultValues: toEndingFormValues(node),
	});

	const onSubmit = (values: EndingFormValues) => {
		onSave(toEndingPatch(values));
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
				label='Text'
				registration={register('text')}
				error={errors.text?.message}
				multiline
			/>
			<SaveActions saved={isSubmitSuccessful && !isDirty} />
		</form>
	);
}
