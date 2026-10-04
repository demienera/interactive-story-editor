import { MarkerType, type Edge, type Node } from '@xyflow/react';
import type {
	ChoiceEdge,
	EndingNode,
	SceneNode,
	StartNode,
	Story,
	StoryEdge,
	StoryNode,
} from '@/entities/story/model/types';
import type { EditorLayout } from './editor-layout';

// React Flow node `type` matches the domain `node.type`, so React Flow picks the component from `nodeTypes`.
// Custom nodes only read `data.node`; changes to the story go through domain operations.
export type StartFlowNode = Node<{ node: StartNode }, 'start'>;
export type SceneFlowNode = Node<{ node: SceneNode }, 'scene'>;
export type EndingFlowNode = Node<{ node: EndingNode }, 'ending'>;

export type StoryFlowNode = StartFlowNode | SceneFlowNode | EndingFlowNode;

function getNodeAriaLabel(node: StoryNode): string {
	switch (node.type) {
		case 'start':
			return `Start: ${node.title}`;
		case 'scene':
			if (node.choices.length === 0) {
				return `Scene: ${node.title}`;
			}

			return `Scene: ${node.title}, ${node.choices.length} ${node.choices.length === 1 ? 'choice' : 'choices'}`;
		case 'ending':
			return `Ending: ${node.title}`;
	}
}

function createFlowNode(node: StoryNode, layout: EditorLayout): StoryFlowNode {
	const base = {
		id: node.id,
		position: layout[node.id] ?? { x: 0, y: 0 },
		ariaLabel: getNodeAriaLabel(node),
	};

	switch (node.type) {
		case 'start':
			return { ...base, type: 'start', data: { node } };
		case 'scene':
			return { ...base, type: 'scene', data: { node } };
		case 'ending':
			return { ...base, type: 'ending', data: { node } };
	}
}

function getNodeTitle(story: Story, nodeId: string): string {
	return story.nodes.find((node) => node.id === nodeId)?.title ?? nodeId;
}

function getChoiceLabel(story: Story, edge: ChoiceEdge): string {
	const sourceNode = story.nodes.find((node) => node.id === edge.source);
	const choice =
		sourceNode?.type === 'scene' ? sourceNode.choices.find((item) => item.id === edge.choiceId) : undefined;

	return choice?.label ?? edge.choiceId;
}

function createFlowEdge(story: Story, edge: StoryEdge): Edge {
	const flowEdge: Edge = {
		id: edge.id,
		source: edge.source,
		target: edge.target,
		type: 'story',
		markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-edge)' },
	};

	if (edge.type === 'continue') {
		return {
			...flowEdge,
			ariaLabel: `Continue from ${getNodeTitle(story, edge.source)} to ${getNodeTitle(story, edge.target)}`,
		};
	}

	return {
		...flowEdge,
		sourceHandle: edge.choiceId,
		ariaLabel: `Choice "${getChoiceLabel(story, edge)}" from ${getNodeTitle(story, edge.source)} to ${getNodeTitle(story, edge.target)}`,
	};
}

export function storyToFlow(
	story: Story,
	layout: EditorLayout,
): {
	nodes: StoryFlowNode[];
	edges: Edge[];
} {
	return {
		nodes: story.nodes.map((node) => createFlowNode(node, layout)),
		edges: story.edges.map((edge) => createFlowEdge(story, edge)),
	};
}
