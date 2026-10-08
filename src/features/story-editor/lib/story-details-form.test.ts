import { describe, expect, test } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import { updateStoryDetails } from '@/entities/story/model/story-operations';
import { storyDetailsSchema, toStoryDetailsPatch, toStoryDetailsValues } from './story-details-form';

describe('storyDetailsSchema', () => {
	test('trims the title and the description', () => {
		expect(storyDetailsSchema.parse({ title: '  The Gate  ', description: '  A short story. ' })).toEqual({
			title: 'The Gate',
			description: 'A short story.',
		});
	});

	test('requires a title', () => {
		const result = storyDetailsSchema.safeParse({ title: '   ', description: '' });

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Enter a title.');
	});

	test('allows an empty description', () => {
		expect(storyDetailsSchema.safeParse({ title: 'The Gate', description: '' }).success).toBe(true);
	});

	test('limits the length of the description', () => {
		const result = storyDetailsSchema.safeParse({ title: 'The Gate', description: 'a'.repeat(501) });

		expect(result.error?.issues[0]?.message).toBe('Keep the description under 500 characters.');
	});
});

describe('story details values', () => {
	test('saving unchanged values keeps the same story', () => {
		const patch = toStoryDetailsPatch(toStoryDetailsValues(whisperingForest));

		expect(updateStoryDetails(whisperingForest, patch)).toBe(whisperingForest);
	});
});
