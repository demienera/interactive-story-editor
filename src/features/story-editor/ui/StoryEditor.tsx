'use client';

import { useMemo } from 'react';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import { demoStory } from '@/entities/story/data/demo-story';
import { layoutByDepth } from '../lib/auto-layout';
import { storyToFlow } from '../lib/story-to-flow';
import { nodeTypes } from './nodes/node-types';
import '@xyflow/react/dist/style.css';
import styles from './StoryEditor.module.scss';

export function StoryEditor() {
	const { nodes, edges } = useMemo(() => storyToFlow(demoStory, layoutByDepth(demoStory)), []);

	return (
		<main className={styles.editor}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				fitView
			>
				<Background />
				<Controls />
			</ReactFlow>
		</main>
	);
}
