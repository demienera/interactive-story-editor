import { Handle, Position, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import type { SceneFlowNode } from '../../lib/story-to-flow';
import styles from './StoryNode.module.scss';

export function SceneNode({ data, selected }: NodeProps<SceneFlowNode>) {
	const { title, text, choices } = data.node;
	const hasChoices = choices.length > 0;

	return (
		<div className={clsx(styles.node, { [styles.selected]: selected })}>
			<Handle
				type='target'
				position={Position.Top}
			/>
			<p className={styles.type}>Scene</p>
			<p className={styles.title}>{title}</p>
			<p className={styles.text}>{text}</p>

			{hasChoices ? (
				<ul className={styles.choices}>
					{choices.map((choice) => (
						<li
							key={choice.id}
							className={styles.choice}
						>
							{choice.label}
							<Handle
								id={choice.id}
								type='source'
								position={Position.Right}
							/>
						</li>
					))}
				</ul>
			) : (
				<Handle
					type='source'
					position={Position.Bottom}
				/>
			)}
		</div>
	);
}
