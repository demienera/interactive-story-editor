import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SceneFlowNode } from '../../lib/story-to-flow';
import styles from './StoryNode.module.scss';

export function SceneNode({ data }: NodeProps<SceneFlowNode>) {
	const { title, text, choices } = data.node;
	const hasChoices = choices.length > 0;

	return (
		<div className={styles.node}>
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
