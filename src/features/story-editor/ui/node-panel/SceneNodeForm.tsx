import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { SceneNode } from '@/entities/story/model/types';
import { sceneFormSchema, toSceneFormValues, toScenePatch, type SceneFormValues } from '../../lib/node-form';
import { FormField } from './FormField';
import { SaveActions } from './SaveActions';
import styles from './NodePanel.module.scss';

type SceneNodeFormProps = {
	node: SceneNode;
	onSave: (patch: StoryNodePatch) => void;
};

export function SceneNodeForm({ node, onSave }: SceneNodeFormProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitSuccessful },
	} = useForm({
		resolver: zodResolver(sceneFormSchema),
		defaultValues: toSceneFormValues(node),
	});

	const onSubmit = (values: SceneFormValues) => {
		onSave(toScenePatch(node, values));
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

			{node.choices.length > 0 && (
				<fieldset className={styles.fieldset}>
					<legend className={styles.legend}>Choices</legend>
					{node.choices.map((choice, index) => (
						<FormField
							key={choice.id}
							label={`Choice ${index + 1}`}
							registration={register(`choices.${index}.label`)}
							error={errors.choices?.[index]?.label?.message}
						/>
					))}
				</fieldset>
			)}

			<SaveActions saved={isSubmitSuccessful && !isDirty} />
		</form>
	);
}
