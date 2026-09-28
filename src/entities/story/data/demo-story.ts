import type { Story } from '../model/types';

export const demoStory: Story = {
	id: 'whispering-forest',
	title: 'The Whispering Forest',
	description: 'A short branching story about a mysterious forest.',
	nodes: [
		{
			id: 'start',
			type: 'start',
			title: 'Start',
		},
		{
			id: 'forest',
			type: 'scene',
			title: 'The Forest',
			text: 'You wake up beneath an ancient tree. The forest around you is quiet, but somewhere in the distance you hear a faint whisper.',
		},
		{
			id: 'first-choice',
			type: 'choice',
			title: 'What will you do?',
			choices: [
				{
					id: 'follow-whisper',
					label: 'Follow the whisper',
				},
				{
					id: 'find-shelter',
					label: 'Look for shelter',
				},
			],
		},
		{
			id: 'whisper',
			type: 'scene',
			title: 'The Whisper',
			text: 'You follow the sound deeper into the forest and discover a small stone shrine covered in glowing symbols.',
		},
		{
			id: 'shelter',
			type: 'scene',
			title: 'The Shelter',
			text: 'You find an abandoned cabin hidden between the trees. Its door is slightly open.',
		},
		{
			id: 'mysterious-shrine',
			type: 'ending',
			title: 'The Hidden Shrine',
			text: 'The symbols begin to glow brighter. Whatever brought you here seems to have been waiting for you.',
		},
		{
			id: 'old-cabin',
			type: 'ending',
			title: 'The Old Cabin',
			text: 'You step inside the cabin and discover a warm fire still burning. Someone — or something — has been expecting you.',
		},
	],
	edges: [
		{
			id: 'start-to-forest',
			source: 'start',
			target: 'forest',
		},
		{
			id: 'forest-to-choice',
			source: 'forest',
			target: 'first-choice',
		},
		{
			id: 'choice-to-whisper',
			source: 'first-choice',
			target: 'whisper',
			choiceId: 'follow-whisper',
		},
		{
			id: 'choice-to-shelter',
			source: 'first-choice',
			target: 'shelter',
			choiceId: 'find-shelter',
		},
		{
			id: 'whisper-to-ending',
			source: 'whisper',
			target: 'mysterious-shrine',
		},
		{
			id: 'shelter-to-ending',
			source: 'shelter',
			target: 'old-cabin',
		},
	],
};
