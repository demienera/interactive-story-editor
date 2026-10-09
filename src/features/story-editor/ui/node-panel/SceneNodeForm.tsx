import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { SceneNode } from '@/entities/story/model/types';
import { sceneFormSchema, toSceneFormValues, toScenePatch, type SceneFormValues } from '../../lib/node-form';
import { BackgroundField } from './BackgroundField';
import { FormField } from './FormField';
import { SaveActions } from './SaveActions';
import styles from './NodePanel.module.scss';

type SceneNodeFormProps = {
	node: SceneNode;
	onSave: (patch: StoryNodePatch) => void;
	autoFocusTitle: boolean;
};

export function SceneNodeForm({ node, onSave, autoFocusTitle }: SceneNodeFormProps) {
	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitSuccessful },
	} = useForm({
		resolver: zodResolver(sceneFormSchema),
		defaultValues: toSceneFormValues(node),
	});
	const { fields, append, remove } = useFieldArray({ control, name: 'choices' });
	const background = useWatch({ control, name: 'background' });
	const addChoiceRef = useRef<HTMLButtonElement>(null);

	const onSubmit = (values: SceneFormValues) => {
		onSave(toScenePatch(values));
		reset(values);
	};

	const handleRemoveChoice = (index: number) => {
		remove(index);
		addChoiceRef.current?.focus();
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

			<fieldset className={styles.fieldset}>
				<legend className={styles.legend}>Choices</legend>
				{fields.length === 0 && <p className={styles.hint}>No choices: the scene continues to one next node.</p>}
				{fields.map((field, index) => (
					<div
						key={field.id}
						className={styles.choiceRow}
					>
						<FormField
							label={`Choice ${index + 1}`}
							registration={register(`choices.${index}.label`)}
							error={errors.choices?.[index]?.label?.message}
						/>
						<button
							type='button'
							className={styles.secondaryButton}
							aria-label={`Remove choice ${index + 1}`}
							onClick={() => handleRemoveChoice(index)}
						>
							Remove
						</button>
					</div>
				))}
				<button
					ref={addChoiceRef}
					type='button'
					className={styles.secondaryButton}
					onClick={() => append({ choiceId: crypto.randomUUID(), label: '' })}
				>
					Add choice
				</button>
			</fieldset>

			<SaveActions saved={isSubmitSuccessful && !isDirty} />
		</form>
	);
}
