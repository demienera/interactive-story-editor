import { describe, expect, test } from 'vitest';
import { demoStory } from '@/entities/story/data/demo-story';
import { updateNode } from '@/entities/story/model/story-operations';
import type { SceneNode } from '@/entities/story/model/types';
import { validateStory } from '@/entities/story/model/validate-story';
import {
	endingFormSchema,
	sceneFormSchema,
	startFormSchema,
	toEndingPatch,
	toSceneFormValues,
	toScenePatch,
	toStartPatch,
} from './node-form';

const scene: SceneNode = {
	id: 'gate',
	type: 'scene',
	title: 'The Gate',
	text: 'Two paths lead away from the gate.',
	choices: [
		{ id: 'go-left', label: 'Go left' },
		{ id: 'go-right', label: 'Go right' },
	],
};

describe('node form schemas', () => {
	test('reject an empty or whitespace-only title', () => {
		expect(startFormSchema.safeParse({ title: '' }).success).toBe(false);
		expect(startFormSchema.safeParse({ title: '   ' }).success).toBe(false);
	});

	test('trim values', () => {
		expect(endingFormSchema.parse({ title: '  The End  ', text: ' Bye. ' })).toEqual({
			title: 'The End',
			text: 'Bye.',
		});
	});

	test('reject a title that is too long', () => {
		const result = startFormSchema.safeParse({ title: 'a'.repeat(81) });

		expect(result.success).toBe(false);
	});

	test('reject an empty choice label with a path to the field', () => {
		const result = sceneFormSchema.safeParse({
			title: 'Gate',
			text: 'Text',
			choices: [
				{ choiceId: 'left', label: 'Left' },
				{ choiceId: 'right', label: '' },
			],
		});

		expect(result.error?.issues[0]?.path).toEqual(['choices', 1, 'label']);
	});
});

describe('scene form mapping', () => {
	test('turns a scene into form values', () => {
		expect(toSceneFormValues(scene)).toEqual({
			title: 'The Gate',
			text: 'Two paths lead away from the gate.',
			choices: [
				{ choiceId: 'go-left', label: 'Go left' },
				{ choiceId: 'go-right', label: 'Go right' },
			],
		});
	});

	test('keeps choice ids and order when building a patch', () => {
		const patch = toScenePatch({
			title: 'The Old Gate',
			text: 'Moss covers the stones.',
			choices: [
				{ choiceId: 'go-left', label: 'Take the left path' },
				{ choiceId: 'go-right', label: 'Go right' },
			],
		});

		expect(patch).toEqual({
			type: 'scene',
			title: 'The Old Gate',
			text: 'Moss covers the stones.',
			choices: [
				{ id: 'go-left', label: 'Take the left path' },
				{ id: 'go-right', label: 'Go right' },
			],
		});
	});

	test('a removed choice is left out and a new choice keeps its id', () => {
		const patch = toScenePatch({
			title: 'The Gate',
			text: 'Two paths lead away from the gate.',
			choices: [
				{ choiceId: 'go-right', label: 'Go right' },
				{ choiceId: 'new-choice', label: 'Climb the wall' },
			],
		});

		expect(patch).toEqual({
			type: 'scene',
			title: 'The Gate',
			text: 'Two paths lead away from the gate.',
			choices: [
				{ id: 'go-right', label: 'Go right' },
				{ id: 'new-choice', label: 'Climb the wall' },
			],
		});
	});

	test('a saved scene keeps its edges and the story stays valid', () => {
		const forest = demoStory.nodes.find((node) => node.id === 'forest');

		if (forest?.type !== 'scene') {
			throw new Error('The demo story must have a "forest" scene.');
		}

		const values = { ...toSceneFormValues(forest), title: 'The Dark Forest' };
		const story = updateNode(demoStory, forest.id, toScenePatch(values));

		expect(story.edges).toEqual(demoStory.edges);
		expect(validateStory(story)).toEqual([]);
	});
});

describe('start and ending patches', () => {
	test('carry the node type', () => {
		expect(toStartPatch({ title: 'Begin' })).toEqual({ type: 'start', title: 'Begin' });
		expect(toEndingPatch({ title: 'End', text: 'Bye.' })).toEqual({ type: 'ending', title: 'End', text: 'Bye.' });
	});
});
