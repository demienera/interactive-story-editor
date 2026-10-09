import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { StartNode } from '@/entities/story/model/types';
import { startFormSchema, toStartFormValues, toStartPatch, type StartFormValues } from '../../lib/node-form';
import { BackgroundField } from './BackgroundField';
import { FormField } from './FormField';
import { SaveActions } from './SaveActions';
import styles from './NodePanel.module.scss';

type StartNodeFormProps = {
	node: StartNode;
	onSave: (patch: StoryNodePatch) => void;
	autoFocusTitle: boolean;
};

export function StartNodeForm({ node, onSave, autoFocusTitle }: StartNodeFormProps) {
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitSuccessful },
	} = useForm({
		resolver: zodResolver(startFormSchema),
		defaultValues: toStartFormValues(node),
	});
	const background = useWatch({ control, name: 'background' });

	const onSubmit = (values: StartFormValues) => {
		onSave(toStartPatch(values));
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
				autoFocus={autoFocusTitle}
			/>
			<BackgroundField
				registration={register('background')}
				value={background}
			/>
			<SaveActions saved={isSubmitSuccessful && !isDirty} />
		</form>
	);
}
