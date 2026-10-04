'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
	Background,
	Controls,
	Panel,
	ReactFlow,
	type AriaLabelConfig,
	type Connection,
	type Edge,
	type NodeChange,
	type ReactFlowInstance,
	type XYPosition,
} from '@xyflow/react';
import { demoStory } from '@/entities/story/data/demo-story';
import { getNode } from '@/entities/story/model/story-engine';
import { addNode, removeNode, type StoryNodePatch } from '@/entities/story/model/story-operations';
import type { Story, StoryNodeType } from '@/entities/story/model/types';
import { layoutByDepth } from '../lib/auto-layout';
import {
	applyPositionChanges,
	applySizeChanges,
	removeNodeFromLayout,
	type EditorLayout,
	type NodeSizes,
} from '../lib/editor-layout';
import { createNode } from '../lib/node-factory';
import { storyToFlow, type StoryFlowNode } from '../lib/story-to-flow';
import {
	canLeadTo,
	getExitFromHandle,
	setExitTarget,
	updateNodeAndExits,
	type Exit,
} from '../lib/transitions';
import { edgeTypes } from './edges/edge-types';
import { NodePanel } from './node-panel/NodePanel';
import { nodeTypes } from './nodes/node-types';
import '@xyflow/react/dist/style.css';
import styles from './StoryEditor.module.scss';

const NODE_DESCRIPTION =
	'Press Enter or Space to select the node and edit it in the panel. Use the arrow keys to move a selected node. Press Escape to clear the selection.';

const ariaLabelConfig: Partial<AriaLabelConfig> = {
	'node.a11yDescription.default': NODE_DESCRIPTION,
	'node.a11yDescription.keyboardDisabled': NODE_DESCRIPTION,
	'edge.a11yDescription.default': '',
	'handle.ariaLabel': 'Connection point',
};

// Matches `.node` width in StoryNode.module.scss.
const NODE_WIDTH = 220;

const typeLabels = {
	start: 'Start',
	scene: 'Scene',
	ending: 'Ending',
} satisfies Record<StoryNodeType, string>;

export function StoryEditor() {
	const [story, setStory] = useState<Story>(demoStory);
	const [layout, setLayout] = useState<EditorLayout>(() => layoutByDepth(demoStory));
	const [nodeSizes, setNodeSizes] = useState<NodeSizes>({});
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState('');
	const canvasRef = useRef<HTMLDivElement>(null);
	const flowInstance = useRef<ReactFlowInstance<StoryFlowNode, Edge> | null>(null);

	const flow = useMemo(() => storyToFlow(story, layout), [story, layout]);
	const nodes = useMemo<StoryFlowNode[]>(
		() =>
			flow.nodes.map((node) => ({
				...node,
				measured: nodeSizes[node.id],
				selected: node.id === selectedNodeId,
			})),
		[flow.nodes, nodeSizes, selectedNodeId],
	);
	const selectedNode = selectedNodeId ? getNode(story, selectedNodeId) : undefined;
	const hasStartNode = story.nodes.some((node) => node.type === 'start');

	const handleNodesChange = (changes: NodeChange<StoryFlowNode>[]) => {
		setLayout((current) => applyPositionChanges(current, changes));
		setNodeSizes((current) => applySizeChanges(current, changes));

		for (const change of changes) {
			if (change.type !== 'select') {
				continue;
			}

			setCreatedNodeId(null);

			if (change.selected) {
				setSelectedNodeId(change.id);
			} else {
				setSelectedNodeId((current) => (current === change.id ? null : current));
			}
		}
	};

	const getNewNodePosition = (): XYPosition => {
		const canvas = canvasRef.current?.getBoundingClientRect();
		const instance = flowInstance.current;

		if (!canvas || !instance) {
			return { x: 0, y: 0 };
		}

		const center = instance.screenToFlowPosition({
			x: canvas.left + canvas.width / 2,
			y: canvas.top + canvas.height / 2,
		});

		return { x: center.x - NODE_WIDTH / 2, y: center.y };
	};

	const handleAddNode = (type: StoryNodeType) => {
		const node = createNode(type, crypto.randomUUID());
		const position = getNewNodePosition();

		setStory((current) => addNode(current, node));
		setLayout((current) => ({ ...current, [node.id]: position }));
		setSelectedNodeId(node.id);
		setCreatedNodeId(node.id);
		setStatusMessage(`${typeLabels[type]} added`);
	};

	const handleSave = (nodeId: string, patch: StoryNodePatch) => {
		setStory((current) => updateNodeAndExits(current, nodeId, patch));
	};

	const handleExitChange = (exit: Exit, targetId: string | null) => {
		const target = targetId ? getNode(story, targetId) : undefined;

		setStory((current) => setExitTarget(current, exit, targetId, crypto.randomUUID()));
		setStatusMessage(target ? `Connected to "${target.title}"` : 'Connection removed');
	};

	const handleConnect = (connection: Connection) => {
		const exit = getExitFromHandle(story, connection.source, connection.sourceHandle ?? null);

		if (exit) {
			handleExitChange(exit, connection.target);
		}
	};

	const isValidConnection = (connection: Connection | Edge) =>
		canLeadTo(story, connection.source, connection.target);

	const handleDeleteNode = (nodeId: string) => {
		const node = getNode(story, nodeId);

		setStory((current) => removeNode(current, nodeId));
		setLayout((current) => removeNodeFromLayout(current, nodeId));
		setNodeSizes((current) => removeNodeFromLayout(current, nodeId));
		setSelectedNodeId(null);
		setCreatedNodeId(null);
		setStatusMessage(node ? `${typeLabels[node.type]} "${node.title}" deleted` : '');
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
				<div
					ref={canvasRef}
					className={styles.canvas}
				>
					<ReactFlow
						nodes={nodes}
						edges={flow.edges}
						nodeTypes={nodeTypes}
						edgeTypes={edgeTypes}
						onNodesChange={handleNodesChange}
						onInit={(instance) => {
							flowInstance.current = instance;
						}}
						onConnect={handleConnect}
						isValidConnection={isValidConnection}
						deleteKeyCode={null}
						ariaLabelConfig={ariaLabelConfig}
						fitView
					>
						<Panel
							position='top-right'
							className={styles.addPanel}
						>
							<button
								type='button'
								className={styles.addButton}
								onClick={() => handleAddNode('scene')}
							>
								Add scene
							</button>
							<button
								type='button'
								className={styles.addButton}
								onClick={() => handleAddNode('ending')}
							>
								Add ending
							</button>
							{!hasStartNode && (
								<button
									type='button'
									className={styles.addButton}
									onClick={() => handleAddNode('start')}
								>
									Add start
								</button>
							)}
						</Panel>
						<Background />
						<Controls />
					</ReactFlow>
				</div>

				<NodePanel
					story={story}
					node={selectedNode}
					autoFocusTitle={selectedNodeId !== null && selectedNodeId === createdNodeId}
					onSave={handleSave}
					onDelete={handleDeleteNode}
					onExitChange={handleExitChange}
				/>
			</main>

			<p
				role='status'
				className={styles.visuallyHidden}
			>
				{statusMessage}
			</p>
		</div>
	);
}
