import type { StoryNode, StoryNodeType } from '@/entities/story/model/types';

export function createNode(type: StoryNodeType, id: string): StoryNode {
	switch (type) {
		case 'start':
			return { id, type, title: 'Start' };
		case 'scene':
			return { id, type, title: 'New scene', text: '', choices: [] };
		case 'ending':
			return { id, type, title: 'New ending', text: '' };
	}
}
