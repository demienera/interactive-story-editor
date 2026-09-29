import type { NodeTypes } from '@xyflow/react';
import { EndingNode } from './EndingNode';
import { SceneNode } from './SceneNode';
import { StartNode } from './StartNode';

export const nodeTypes = {
	start: StartNode,
	scene: SceneNode,
	ending: EndingNode,
} satisfies NodeTypes;
