'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Background, Controls, ReactFlow, type AriaLabelConfig, type NodeChange } from '@xyflow/react';
import { demoStory } from '@/entities/story/data/demo-story';
import { getNode } from '@/entities/story/model/story-engine';
import { updateNode, type StoryNodePatch } from '@/entities/story/model/story-operations';
import type { Story } from '@/entities/story/model/types';
import { layoutByDepth } from '../lib/auto-layout';
import { storyToFlow, type StoryFlowNode } from '../lib/story-to-flow';
import { NodePanel } from './node-panel/NodePanel';
import { nodeTypes } from './nodes/node-types';
import '@xyflow/react/dist/style.css';
import styles from './StoryEditor.module.scss';

const NODE_DESCRIPTION = 'Press Enter or Space to edit the node in the panel. Press Escape to clear the selection.';

const ariaLabelConfig: Partial<AriaLabelConfig> = {
	'node.a11yDescription.default': NODE_DESCRIPTION,
	'node.a11yDescription.keyboardDisabled': NODE_DESCRIPTION,
	'edge.a11yDescription.default': '',
};

export function StoryEditor() {
	const [story, setStory] = useState<Story>(demoStory);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const flow = useMemo(() => storyToFlow(story, layoutByDepth(story)), [story]);
	const nodes = useMemo(
		() => flow.nodes.map((node) => (node.id === selectedNodeId ? { ...node, selected: true } : node)),
		[flow.nodes, selectedNodeId],
	);
	const selectedNode = selectedNodeId ? getNode(story, selectedNodeId) : undefined;

	const handleNodesChange = (changes: NodeChange<StoryFlowNode>[]) => {
		for (const change of changes) {
			if (change.type !== 'select') {
				continue;
			}

			if (change.selected) {
				setSelectedNodeId(change.id);
			} else {
				setSelectedNodeId((current) => (current === change.id ? null : current));
			}
		}
	};

	const handleSave = (nodeId: string, patch: StoryNodePatch) => {
		setStory((current) => updateNode(current, nodeId, patch));
	};

	return (
		<div className={styles.layout}>
			<header className={styles.toolbar}>
				<nav aria-label='Editor'>
					<Link
						href='/'
						className={styles.control}
					>
						<span aria-hidden='true'>←</span> Home
					</Link>
				</nav>
				<h1 className={styles.title}>{story.title}</h1>
				<Link
					href='/play'
					className={styles.control}
				>
					Play story
				</Link>
			</header>

			<main className={styles.workspace}>
				<div className={styles.canvas}>
					<ReactFlow
						nodes={nodes}
						edges={flow.edges}
						nodeTypes={nodeTypes}
						onNodesChange={handleNodesChange}
						nodesDraggable={false}
						nodesConnectable={false}
						deleteKeyCode={null}
						ariaLabelConfig={ariaLabelConfig}
						fitView
					>
						<Background />
						<Controls />
					</ReactFlow>
				</div>

				<NodePanel
					node={selectedNode}
					onSave={handleSave}
				/>
			</main>
		</div>
	);
}
