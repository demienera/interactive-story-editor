import { z } from 'zod';
import type { StoryDetailsPatch } from '@/entities/story/model/story-operations';
import type { Story } from '@/entities/story/model/types';
import { titleSchema } from './node-form';

const DESCRIPTION_MAX_LENGTH = 500;

export const storyDetailsSchema = z.object({
	title: titleSchema,
	description: z
		.string()
		.trim()
		.max(DESCRIPTION_MAX_LENGTH, `Keep the description under ${DESCRIPTION_MAX_LENGTH} characters.`),
});

export type StoryDetailsValues = z.infer<typeof storyDetailsSchema>;

export function toStoryDetailsValues(story: Story): StoryDetailsValues {
	return { title: story.title, description: story.description };
}

export function toStoryDetailsPatch(values: StoryDetailsValues): StoryDetailsPatch {
	return { title: values.title, description: values.description };
}
