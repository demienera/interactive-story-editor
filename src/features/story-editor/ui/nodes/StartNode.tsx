import { Handle, Position, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import type { StartFlowNode } from '../../lib/story-to-flow';
import styles from './StoryNode.module.scss';

export function StartNode({ data }: NodeProps<StartFlowNode>) {
	return (
		<div className={clsx(styles.node, styles.start)}>
			<p className={styles.type}>Start</p>
			<p className={styles.title}>{data.node.title}</p>
			<Handle
				type='source'
				position={Position.Bottom}
			/>
		</div>
	);
}
