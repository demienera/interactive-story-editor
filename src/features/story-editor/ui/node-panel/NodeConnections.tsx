import { useId } from 'react';
import type { Story, StoryNode } from '@/entities/story/model/types';
import { canLeadTo, getExits, getExitTarget, type Exit } from '../../lib/transitions';
import styles from './NodePanel.module.scss';

type NodeConnectionsProps = {
	story: Story;
	node: StoryNode;
	onChange: (exit: Exit, targetId: string | null) => void;
};

const typeLabels = {
	start: 'Start',
	scene: 'Scene',
	ending: 'Ending',
} satisfies Record<StoryNode['type'], string>;

function getExitLabel(node: StoryNode, exit: Exit): string {
	if (exit.type === 'continue') {
		return 'Continue to';
	}

	const choice = node.type === 'scene' ? node.choices.find((item) => item.id === exit.choiceId) : undefined;

	return `"${choice?.label ?? exit.choiceId}" leads to`;
}

export function NodeConnections({ story, node, onChange }: NodeConnectionsProps) {
	const baseId = useId();
	const exits = getExits(node);

	if (exits.length === 0) {
		return null;
	}

	const targets = story.nodes.filter((target) => canLeadTo(story, node.id, target.id));

	return (
		<section
			className={styles.connections}
			aria-labelledby={`${baseId}-heading`}
		>
			<h3
				id={`${baseId}-heading`}
				className={styles.subheading}
			>
				Connections
			</h3>
			{node.type === 'scene' && (
				<p className={styles.hint}>New choices appear here after you save the scene.</p>
			)}

			{exits.map((exit, index) => {
				const selectId = `${baseId}-${index}`;

				return (
					<div
						key={exit.type === 'choice' ? exit.choiceId : 'continue'}
						className={styles.field}
					>
						<label
							htmlFor={selectId}
							className={styles.label}
						>
							{getExitLabel(node, exit)}
						</label>
						<select
							id={selectId}
							className={styles.control}
							value={getExitTarget(story, exit) ?? ''}
							onChange={(event) => onChange(exit, event.target.value || null)}
						>
							<option value=''>Not connected</option>
							{targets.map((target) => (
								<option
									key={target.id}
									value={target.id}
								>
									{typeLabels[target.type]}: {target.title}
								</option>
							))}
						</select>
					</div>
				);
			})}
		</section>
	);
}
