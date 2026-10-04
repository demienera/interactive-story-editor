import { getNode } from '@/entities/story/model/story-engine';
import { connect, disconnect, updateNode, type StoryNodePatch } from '@/entities/story/model/story-operations';
import type { Story, StoryEdge, StoryNode } from '@/entities/story/model/types';

export type Exit = { type: 'continue'; sourceId: string } | { type: 'choice'; sourceId: string; choiceId: string };

export function getExits(node: StoryNode): Exit[] {
	if (node.type === 'ending') {
		return [];
	}

	if (node.type === 'scene' && node.choices.length > 0) {
		return node.choices.map((choice) => ({ type: 'choice', sourceId: node.id, choiceId: choice.id }));
	}

	return [{ type: 'continue', sourceId: node.id }];
}

function isExitEdge(edge: StoryEdge, exit: Exit): boolean {
	if (edge.source !== exit.sourceId || edge.type !== exit.type) {
		return false;
	}

	return edge.type === 'continue' || (exit.type === 'choice' && edge.choiceId === exit.choiceId);
}

export function getExitTarget(story: Story, exit: Exit): string | undefined {
	return story.edges.find((edge) => isExitEdge(edge, exit))?.target;
}

export function setExitTarget(story: Story, exit: Exit, targetId: string | null, edgeId: string): Story {
	const withoutExit = story.edges
		.filter((edge) => isExitEdge(edge, exit))
		.reduce((current, edge) => disconnect(current, edge.id), story);

	if (targetId === null) {
		return withoutExit;
	}

	const edge: StoryEdge =
		exit.type === 'continue'
			? { id: edgeId, type: 'continue', source: exit.sourceId, target: targetId }
			: { id: edgeId, type: 'choice', source: exit.sourceId, target: targetId, choiceId: exit.choiceId };

	return connect(withoutExit, edge);
}

export function getExitFromHandle(story: Story, sourceId: string, sourceHandle: string | null): Exit | undefined {
	const source = getNode(story, sourceId);

	if (!source) {
		return undefined;
	}

	return getExits(source).find((exit) =>
		exit.type === 'choice' ? exit.choiceId === sourceHandle : sourceHandle === null,
	);
}

export function canLeadTo(story: Story, sourceId: string, targetId: string): boolean {
	const target = getNode(story, targetId);

	return target !== undefined && target.type !== 'start' && targetId !== sourceId;
}

export function updateNodeAndExits(story: Story, nodeId: string, patch: StoryNodePatch): Story {
	const updated = updateNode(story, nodeId, patch);

	if (patch.type !== 'scene' || !patch.choices || patch.choices.length === 0) {
		return updated;
	}

	return updated.edges
		.filter((edge) => edge.type === 'continue' && edge.source === nodeId)
		.reduce((current, edge) => disconnect(current, edge.id), updated);
}
