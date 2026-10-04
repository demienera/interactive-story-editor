import { useEffect, useId, useRef } from 'react';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { Story, StoryNode } from '@/entities/story/model/types';
import type { Exit } from '../../lib/transitions';
import { EndingNodeForm } from './EndingNodeForm';
import { NodeConnections } from './NodeConnections';
import { SceneNodeForm } from './SceneNodeForm';
import { StartNodeForm } from './StartNodeForm';
import styles from './NodePanel.module.scss';

type NodePanelProps = {
	story: Story;
	node: StoryNode | undefined;
	autoFocusTitle: boolean;
	onSave: (nodeId: string, patch: StoryNodePatch) => void;
	onDelete: (nodeId: string) => void;
	onExitChange: (exit: Exit, targetId: string | null) => void;
};

const headings = {
	start: 'Edit start',
	scene: 'Edit scene',
	ending: 'Edit ending',
} satisfies Record<StoryNode['type'], string>;

const deleteLabels = {
	start: 'Delete start',
	scene: 'Delete scene',
	ending: 'Delete ending',
} satisfies Record<StoryNode['type'], string>;

export function NodePanel({ story, node, autoFocusTitle, onSave, onDelete, onExitChange }: NodePanelProps) {
	const headingId = useId();
	const headingRef = useRef<HTMLHeadingElement>(null);
	const shouldFocusHeading = useRef(false);

	useEffect(() => {
		if (!shouldFocusHeading.current) {
			return;
		}

		shouldFocusHeading.current = false;
		headingRef.current?.focus();
	}, [node]);

	const handleDelete = (nodeToDelete: StoryNode) => {
		if (!window.confirm(`Delete "${nodeToDelete.title}" and its connections?`)) {
			return;
		}

		shouldFocusHeading.current = true;
		onDelete(nodeToDelete.id);
	};

	return (
		<aside
			className={styles.panel}
			aria-labelledby={headingId}
		>
			<h2
				ref={headingRef}
				id={headingId}
				tabIndex={-1}
				className={styles.heading}
			>
				{node ? headings[node.type] : 'Node details'}
			</h2>

			{node ? (
				<>
					<NodeForm
						key={node.id}
						node={node}
						autoFocusTitle={autoFocusTitle}
						onSave={(patch) => onSave(node.id, patch)}
					/>
					<NodeConnections
						story={story}
						node={node}
						onChange={onExitChange}
					/>
					<button
						type='button'
						className={styles.delete}
						onClick={() => handleDelete(node)}
					>
						{deleteLabels[node.type]}
					</button>
				</>
			) : (
				<p className={styles.empty}>Select a node on the graph to edit it.</p>
			)}
		</aside>
	);
}

type NodeFormProps = {
	node: StoryNode;
	autoFocusTitle: boolean;
	onSave: (patch: StoryNodePatch) => void;
};

function NodeForm({ node, autoFocusTitle, onSave }: NodeFormProps) {
	switch (node.type) {
		case 'start':
			return (
				<StartNodeForm
					node={node}
					autoFocusTitle={autoFocusTitle}
					onSave={onSave}
				/>
			);
		case 'scene':
			return (
				<SceneNodeForm
					node={node}
					autoFocusTitle={autoFocusTitle}
					onSave={onSave}
				/>
			);
		case 'ending':
			return (
				<EndingNodeForm
					node={node}
					autoFocusTitle={autoFocusTitle}
					onSave={onSave}
				/>
			);
	}
}
