import type { Edge, Node } from '@xyflow/react';
import type { Story, StoryEdge, StoryNode } from '@/entities/story/model/types';
import type { EditorLayout } from './auto-layout';

export type StoryFlowNodeData = {
	label: string;
	nodeType: StoryNode['type'];
};

export type StoryFlowNode = Node<StoryFlowNodeData>;

function createFlowNode(node: StoryNode, layout: EditorLayout): StoryFlowNode {
	return {
		id: node.id,
		position: layout[node.id] ?? { x: 0, y: 0 },
		data: {
			label: node.title,
			nodeType: node.type,
		},
	};
}

function getChoiceLabel(story: Story, edge: StoryEdge): string | undefined {
	if (edge.type !== 'choice') {
		return undefined;
	}

	const sourceNode = story.nodes.find((node) => node.id === edge.source);
	const choice =
		sourceNode?.type === 'scene' ? sourceNode.choices.find((item) => item.id === edge.choiceId) : undefined;

	return choice?.label ?? edge.choiceId;
}

function createFlowEdge(story: Story, edge: StoryEdge): Edge {
	const label = getChoiceLabel(story, edge);

	return {
		id: edge.id,
		source: edge.source,
		target: edge.target,
		...(label && { label }),
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
