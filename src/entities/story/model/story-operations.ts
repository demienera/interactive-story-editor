import { getNode } from './story-engine';
import type { Story, StoryEdge, StoryNode } from './types';

type PatchOf<T> = T extends StoryNode ? Pick<T, 'type'> & Partial<Omit<T, 'id' | 'type'>> : never;

export type StoryNodePatch = PatchOf<StoryNode>;

export function addNode(story: Story, node: StoryNode): Story {
	if (getNode(story, node.id)) {
		throw new Error(`Node "${node.id}" already exists.`);
	}

	return { ...story, nodes: [...story.nodes, node] };
}

export function updateNode(story: Story, nodeId: string, patch: StoryNodePatch): Story {
	const node = getNode(story, nodeId);

	if (!node) {
		throw new Error(`Node "${nodeId}" does not exist.`);
	}

	const updatedNode = applyPatch(node, patch);
	const nodes = story.nodes.map((current) => (current.id === nodeId ? updatedNode : current));

	if (patch.type !== 'scene' || !patch.choices) {
		return { ...story, nodes };
	}

	const choiceIds = new Set(patch.choices.map((choice) => choice.id));
	const edges = story.edges.filter(
		(edge) => !(edge.type === 'choice' && edge.source === nodeId && !choiceIds.has(edge.choiceId)),
	);

	return { ...story, nodes, edges };
}

export function removeNode(story: Story, nodeId: string): Story {
	if (!getNode(story, nodeId)) {
		throw new Error(`Node "${nodeId}" does not exist.`);
	}

	return {
		...story,
		nodes: story.nodes.filter((node) => node.id !== nodeId),
		edges: story.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
	};
}

export function connect(story: Story, edge: StoryEdge): Story {
	if (story.edges.some((current) => current.id === edge.id)) {
		throw new Error(`Edge "${edge.id}" already exists.`);
	}

	const source = getNode(story, edge.source);

	if (!source) {
		throw new Error(`Source node "${edge.source}" does not exist.`);
	}

	if (!getNode(story, edge.target)) {
		throw new Error(`Target node "${edge.target}" does not exist.`);
	}

	if (edge.type === 'choice') {
		if (source.type !== 'scene') {
			throw new Error(`Choice edge "${edge.id}" must start from a scene.`);
		}

		if (!source.choices.some((choice) => choice.id === edge.choiceId)) {
			throw new Error(`Choice "${edge.choiceId}" does not exist in scene "${source.id}".`);
		}
	}

	return { ...story, edges: [...story.edges, edge] };
}

export function disconnect(story: Story, edgeId: string): Story {
	if (!story.edges.some((edge) => edge.id === edgeId)) {
		throw new Error(`Edge "${edgeId}" does not exist.`);
	}

	return { ...story, edges: story.edges.filter((edge) => edge.id !== edgeId) };
}

function applyPatch(node: StoryNode, patch: StoryNodePatch): StoryNode {
	if (node.type === 'start' && patch.type === 'start') {
		return { ...node, ...patch };
	}

	if (node.type === 'scene' && patch.type === 'scene') {
		return { ...node, ...patch };
	}

	if (node.type === 'ending' && patch.type === 'ending') {
		return { ...node, ...patch };
	}

	throw new Error(`Cannot apply a "${patch.type}" patch to ${node.type} node "${node.id}".`);
}
