import { getStartNode } from '@/entities/story/model/story-engine';
import type { Story } from '@/entities/story/model/types';
import type { EditorLayout } from './editor-layout';

const LEVEL_HEIGHT = 260;
const SIBLING_WIDTH = 300;

/**
 * Initial top-down layout: level (y) = distance from the start node (BFS depth),
 * position within the level (x) = order of nodes in `story.nodes`.
 * Nodes unreachable from start go to an extra last level.
 * Top-down matches default React Flow handles (target on top, source at the bottom).
 * After that the author moves nodes, and the editor keeps the layout as its own state.
 */
export function layoutByDepth(story: Story): EditorLayout {
	const depths = new Map<string, number>();
	const startNode = getStartNode(story);

	if (startNode) {
		depths.set(startNode.id, 0);
		const queue = [startNode.id];

		for (const nodeId of queue) {
			const depth = depths.get(nodeId) ?? 0;

			for (const edge of story.edges) {
				if (edge.source === nodeId && !depths.has(edge.target)) {
					depths.set(edge.target, depth + 1);
					queue.push(edge.target);
				}
			}
		}
	}

	const unreachableLevel = Math.max(-1, ...depths.values()) + 1;
	const nodesInLevel = new Map<number, number>();
	const layout: EditorLayout = {};

	for (const node of story.nodes) {
		const level = depths.get(node.id) ?? unreachableLevel;
		const indexInLevel = nodesInLevel.get(level) ?? 0;

		nodesInLevel.set(level, indexInLevel + 1);
		layout[node.id] = { x: indexInLevel * SIBLING_WIDTH, y: level * LEVEL_HEIGHT };
	}

	return layout;
}

export function completeLayout(story: Story, layout: EditorLayout): EditorLayout {
	return { ...layoutByDepth(story), ...layout };
}
