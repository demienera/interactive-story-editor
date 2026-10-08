'use client';

import Link from 'next/link';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
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
import { getNode } from '@/entities/story/model/story-engine';
import { addNode, removeNode, type StoryNodePatch } from '@/entities/story/model/story-operations';
import type { Story, StoryNodeType } from '@/entities/story/model/types';
import { layoutByDepth } from '../lib/auto-layout';
import { applyPositionChanges, applySizeChanges, type EditorLayout, type NodeSizes } from '../lib/editor-layout';
import { createHistory, pushHistory, redo, undo, type History } from '../lib/history';
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
import { IssuesPanel } from './issues-panel/IssuesPanel';
import { NodePanel } from './node-panel/NodePanel';
import { nodeTypes } from './nodes/node-types';
import '@xyflow/react/dist/style.css';
import styles from './StoryEditor.module.scss';

const NODE_DESCRIPTION =
	'Press Enter or Space to select the node and edit it in the panel. Use the arrow keys to move a selected node. Press Delete to delete it. Press Escape to clear the selection.';

const DELETE_KEYS = ['Delete', 'Backspace'];

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

type StoryRevision = {
	story: Story;
	action: string;
};

function isTextInput(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement ||
		(target instanceof HTMLElement && target.isContentEditable)
	);
}

type StoryEditorProps = {
	initialStory: Story;
	onStoryChange: (story: Story) => void;
};

export function StoryEditor({ initialStory, onStoryChange }: StoryEditorProps) {
	const [history, setHistory] = useState<History<StoryRevision>>(() =>
		createHistory({ story: initialStory, action: '' }),
	);
	const [layout, setLayout] = useState<EditorLayout>(() => layoutByDepth(initialStory));
	const [nodeSizes, setNodeSizes] = useState<NodeSizes>({});
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [createdNodeId, setCreatedNodeId] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState('');
	const [restoreCount, setRestoreCount] = useState(0);
	const canvasRef = useRef<HTMLElement>(null);
	const flowInstance = useRef<ReactFlowInstance<StoryFlowNode, Edge> | null>(null);
	const lastReportedStory = useRef(initialStory);

	const story = history.present.story;
	const canUndo = history.past.length > 0;
	const canRedo = history.future.length > 0;
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

	const commit = (update: (current: Story) => Story, action: string) => {
		setHistory((current) => {
			const next = update(current.present.story);

			return next === current.present.story ? current : pushHistory(current, { story: next, action });
		});
	};

	const restore = (next: History<StoryRevision>, message: string) => {
		setHistory(next);
		setCreatedNodeId(null);
		setSelectedNodeId((current) => (current && getNode(next.present.story, current) ? current : null));
		setRestoreCount((count) => count + 1);
		setStatusMessage(message);
	};

	const handleUndo = () => {
		if (canUndo) {
			restore(undo(history), `Undone: ${history.present.action}`);
		}
	};

	const handleRedo = () => {
		if (canRedo) {
			restore(redo(history), `Redone: ${history.future[0].action}`);
		}
	};

	const handleHistoryShortcut = useEffectEvent((event: KeyboardEvent) => {
		if (!(event.ctrlKey || event.metaKey) || event.altKey || event.defaultPrevented || isTextInput(event.target)) {
			return;
		}

		const isUndo = event.code === 'KeyZ' && !event.shiftKey;
		const isRedo = (event.code === 'KeyZ' && event.shiftKey) || (event.code === 'KeyY' && !event.shiftKey);

		if (!isUndo && !isRedo) {
			return;
		}

		event.preventDefault();

		if (isUndo) {
			handleUndo();
		} else {
			handleRedo();
		}
	});

	useEffect(() => {
		document.addEventListener('keydown', handleHistoryShortcut);

		return () => document.removeEventListener('keydown', handleHistoryShortcut);
	}, []);

	const reportStoryChange = useEffectEvent((next: Story) => onStoryChange(next));

	useEffect(() => {
		if (story === lastReportedStory.current) {
			return;
		}

		lastReportedStory.current = story;
		reportStoryChange(story);
	}, [story]);

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

		const message = `${typeLabels[type]} added`;

		commit((current) => addNode(current, node), message);
		setLayout((current) => ({ ...current, [node.id]: position }));
		setSelectedNodeId(node.id);
		setCreatedNodeId(node.id);
		setStatusMessage(message);
	};

	const handleSave = (nodeId: string, patch: StoryNodePatch) => {
		const node = getNode(story, nodeId);
		const action = node ? `${typeLabels[node.type]} "${patch.title ?? node.title}" edited` : 'Node edited';

		commit((current) => updateNodeAndExits(current, nodeId, patch), action);
	};

	const handleExitChange = (exit: Exit, targetId: string | null) => {
		const target = targetId ? getNode(story, targetId) : undefined;

		const message = target ? `Connected to "${target.title}"` : 'Connection removed';

		commit((current) => setExitTarget(current, exit, targetId, crypto.randomUUID()), message);
		setStatusMessage(message);
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
		const action = node ? `${typeLabels[node.type]} "${node.title}" deleted` : 'Node deleted';

		commit((current) => removeNode(current, nodeId), action);
		setSelectedNodeId(null);
		setCreatedNodeId(null);
		setStatusMessage(`${action}. Press Undo to restore.`);
	};

	const handleSelectNode = (nodeId: string) => {
		const node = getNode(story, nodeId);

		setSelectedNodeId(nodeId);
		setCreatedNodeId(null);
		flowInstance.current?.fitView({ nodes: [{ id: nodeId }], duration: 300, maxZoom: 1 });
		setStatusMessage(node ? `${typeLabels[node.type]} "${node.title}" selected` : '');
	};

	const isFocusInCanvas = async () => canvasRef.current?.contains(document.activeElement) ?? false;

	const handleKeyboardDelete = ({ nodes: deletedNodes }: { nodes: StoryFlowNode[] }) => {
		canvasRef.current?.focus();

		for (const node of deletedNodes) {
			handleDeleteNode(node.id);
		}
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
				<div className={styles.history}>
					<button
						type='button'
						className={styles.control}
						aria-disabled={!canUndo}
						aria-keyshortcuts='Control+Z Meta+Z'
						onClick={handleUndo}
					>
						Undo
					</button>
					<button
						type='button'
						className={styles.control}
						aria-disabled={!canRedo}
						aria-keyshortcuts='Control+Shift+Z Meta+Shift+Z Control+Y'
						onClick={handleRedo}
					>
						Redo
					</button>
				</div>
				<Link
					href={`/play/${story.id}`}
					className={styles.control}
				>
					Play story
				</Link>
			</header>

			<main className={styles.workspace}>
				<section
					ref={canvasRef}
					className={styles.canvas}
					aria-label='Story graph'
					tabIndex={-1}
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
						deleteKeyCode={DELETE_KEYS}
						onBeforeDelete={isFocusInCanvas}
						onDelete={handleKeyboardDelete}
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
				</section>

				<div className={styles.sidebar}>
					<IssuesPanel
						story={story}
						onSelectNode={handleSelectNode}
					/>
					<NodePanel
						story={story}
						node={selectedNode}
						formKey={selectedNode ? `${selectedNode.id}-${restoreCount}` : ''}
						autoFocusTitle={selectedNodeId !== null && selectedNodeId === createdNodeId}
						onSave={handleSave}
						onDelete={handleDeleteNode}
						onExitChange={handleExitChange}
					/>
				</div>
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
