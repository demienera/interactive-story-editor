import { z } from 'zod';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { EndingNode, SceneNode, StartNode } from '@/entities/story/model/types';

const TITLE_MAX_LENGTH = 80;
const TEXT_MAX_LENGTH = 2000;
const CHOICE_LABEL_MAX_LENGTH = 120;

const titleSchema = z
	.string()
	.trim()
	.min(1, 'Enter a title.')
	.max(TITLE_MAX_LENGTH, `Keep the title under ${TITLE_MAX_LENGTH} characters.`);

const textSchema = z
	.string()
	.trim()
	.min(1, 'Enter the text.')
	.max(TEXT_MAX_LENGTH, `Keep the text under ${TEXT_MAX_LENGTH} characters.`);

const choiceLabelSchema = z
	.string()
	.trim()
	.min(1, 'Enter the choice label.')
	.max(CHOICE_LABEL_MAX_LENGTH, `Keep the label under ${CHOICE_LABEL_MAX_LENGTH} characters.`);

export const startFormSchema = z.object({ title: titleSchema });

export const endingFormSchema = z.object({ title: titleSchema, text: textSchema });

export const sceneFormSchema = z.object({
	title: titleSchema,
	text: textSchema,
	choices: z.array(z.object({ label: choiceLabelSchema })),
});

export type StartFormValues = z.infer<typeof startFormSchema>;
export type EndingFormValues = z.infer<typeof endingFormSchema>;
export type SceneFormValues = z.infer<typeof sceneFormSchema>;

export function toStartFormValues(node: StartNode): StartFormValues {
	return { title: node.title };
}

export function toStartPatch(values: StartFormValues): StoryNodePatch {
	return { type: 'start', title: values.title };
}

export function toEndingFormValues(node: EndingNode): EndingFormValues {
	return { title: node.title, text: node.text };
}

export function toEndingPatch(values: EndingFormValues): StoryNodePatch {
	return { type: 'ending', title: values.title, text: values.text };
}

export function toSceneFormValues(node: SceneNode): SceneFormValues {
	return {
		title: node.title,
		text: node.text,
		choices: node.choices.map((choice) => ({ label: choice.label })),
	};
}

export function toScenePatch(node: SceneNode, values: SceneFormValues): StoryNodePatch {
	return {
		type: 'scene',
		title: values.title,
		text: values.text,
		choices: node.choices.map((choice, index) => ({ ...choice, label: values.choices[index]?.label ?? choice.label })),
	};
}
