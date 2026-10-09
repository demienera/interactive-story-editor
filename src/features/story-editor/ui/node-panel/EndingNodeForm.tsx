import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { EndingNode } from '@/entities/story/model/types';
import { endingFormSchema, toEndingFormValues, toEndingPatch, type EndingFormValues } from '../../lib/node-form';
import { BackgroundField } from './BackgroundField';
import { FormField } from './FormField';
import { SaveActions } from './SaveActions';
import styles from './NodePanel.module.scss';

type EndingNodeFormProps = {
	node: EndingNode;
	onSave: (patch: StoryNodePatch) => void;
	autoFocusTitle: boolean;
};

export function EndingNodeForm({ node, onSave, autoFocusTitle }: EndingNodeFormProps) {
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitSuccessful },
	} = useForm({
		resolver: zodResolver(endingFormSchema),
		defaultValues: toEndingFormValues(node),
	});
	const background = useWatch({ control, name: 'background' });

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
				autoFocus={autoFocusTitle}
			/>
			<FormField
				label='Text'
				registration={register('text')}
				error={errors.text?.message}
				multiline
			/>
			<BackgroundField
				registration={register('background')}
				value={background}
			/>
			<SaveActions saved={isSubmitSuccessful && !isDirty} />
		</form>
	);
}
