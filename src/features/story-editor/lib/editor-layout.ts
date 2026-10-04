import type { Dimensions, Node, NodeChange, XYPosition } from '@xyflow/react';
import type { StoryNode } from '@/entities/story/model/types';

export type EditorLayout = Record<StoryNode['id'], XYPosition>;
export type NodeSizes = Record<StoryNode['id'], Dimensions>;

export function applyPositionChanges<NodeType extends Node>(
	layout: EditorLayout,
	changes: NodeChange<NodeType>[],
): EditorLayout {
	let nextLayout = layout;

	for (const change of changes) {
		if (change.type !== 'position' || !change.position) {
			continue;
		}

		if (nextLayout === layout) {
			nextLayout = { ...layout };
		}

		nextLayout[change.id] = change.position;
	}

	return nextLayout;
}

export function applySizeChanges<NodeType extends Node>(sizes: NodeSizes, changes: NodeChange<NodeType>[]): NodeSizes {
	let nextSizes = sizes;

	for (const change of changes) {
		if (change.type !== 'dimensions' || !change.dimensions) {
			continue;
		}

		if (nextSizes === sizes) {
			nextSizes = { ...sizes };
		}

		nextSizes[change.id] = change.dimensions;
	}

	return nextSizes;
}
