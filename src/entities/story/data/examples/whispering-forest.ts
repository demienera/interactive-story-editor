import type { Story } from '../../model/types';

export const whisperingForest: Story = {
	id: 'whispering-forest',
	title: 'The Whispering Forest',
	description: 'A short branching story about a mysterious forest.',
	nodes: [
		{
			id: 'start',
			type: 'start',
			title: 'Start',
			background: 'forest-clearing',
		},
		{
			id: 'forest',
			type: 'scene',
			title: 'The Forest',
			text: 'You wake up beneath an ancient tree. The forest around you is quiet, but somewhere in the distance you hear a faint whisper. What will you do?',
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
			background: 'forest-clearing',
		},
		{
			id: 'whisper',
			type: 'scene',
			title: 'The Whisper',
			text: 'You follow the sound deeper into the forest and discover a small stone shrine covered in glowing symbols.',
			choices: [],
			background: 'forest-shrine',
		},
		{
			id: 'shelter',
			type: 'scene',
			title: 'The Shelter',
			text: 'You find an abandoned cabin hidden between the trees. Its door is slightly open.',
			choices: [],
			background: 'forest-cabin',
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
			background: 'cabin-interior',
		},
	],
	edges: [
		{
			id: 'start-to-forest',
			type: 'continue',
			source: 'start',
			target: 'forest',
		},
		{
			id: 'forest-to-whisper',
			type: 'choice',
			source: 'forest',
			target: 'whisper',
			choiceId: 'follow-whisper',
		},
		{
			id: 'forest-to-shelter',
			type: 'choice',
			source: 'forest',
			target: 'shelter',
			choiceId: 'find-shelter',
		},
		{
			id: 'whisper-to-ending',
			type: 'continue',
			source: 'whisper',
			target: 'mysterious-shrine',
		},
		{
			id: 'shelter-to-ending',
			type: 'continue',
			source: 'shelter',
			target: 'old-cabin',
		},
	],
};
