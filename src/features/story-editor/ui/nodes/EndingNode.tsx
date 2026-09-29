import { Handle, Position, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import type { EndingFlowNode } from '../../lib/story-to-flow';
import styles from './StoryNode.module.scss';

export function EndingNode({ data }: NodeProps<EndingFlowNode>) {
	return (
		<div className={clsx(styles.node, styles.ending)}>
			<Handle
				type='target'
				position={Position.Top}
			/>
			<p className={styles.type}>Ending</p>
			<p className={styles.title}>{data.node.title}</p>
			<p className={styles.text}>{data.node.text}</p>
		</div>
	);
}
