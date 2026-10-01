import { useId } from 'react';
import type { StoryNodePatch } from '@/entities/story/model/story-operations';
import type { StoryNode } from '@/entities/story/model/types';
import { EndingNodeForm } from './EndingNodeForm';
import { SceneNodeForm } from './SceneNodeForm';
import { StartNodeForm } from './StartNodeForm';
import styles from './NodePanel.module.scss';

type NodePanelProps = {
	node: StoryNode | undefined;
	onSave: (nodeId: string, patch: StoryNodePatch) => void;
};

const headings = {
	start: 'Edit start',
	scene: 'Edit scene',
	ending: 'Edit ending',
} satisfies Record<StoryNode['type'], string>;

export function NodePanel({ node, onSave }: NodePanelProps) {
	const headingId = useId();

	return (
		<aside
			className={styles.panel}
			aria-labelledby={headingId}
		>
			<h2
				id={headingId}
				className={styles.heading}
			>
				{node ? headings[node.type] : 'Node details'}
			</h2>

			{node ? (
				<NodeForm
					key={node.id}
					node={node}
					onSave={(patch) => onSave(node.id, patch)}
				/>
			) : (
				<p className={styles.empty}>Select a node on the graph to edit it.</p>
			)}
		</aside>
	);
}

type NodeFormProps = {
	node: StoryNode;
	onSave: (patch: StoryNodePatch) => void;
};

function NodeForm({ node, onSave }: NodeFormProps) {
	switch (node.type) {
		case 'start':
			return (
				<StartNodeForm
					node={node}
					onSave={onSave}
				/>
			);
		case 'scene':
			return (
				<SceneNodeForm
					node={node}
					onSave={onSave}
				/>
			);
		case 'ending':
			return (
				<EndingNodeForm
					node={node}
					onSave={onSave}
				/>
			);
	}
}
