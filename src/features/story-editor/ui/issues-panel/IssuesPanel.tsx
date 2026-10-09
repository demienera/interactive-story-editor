import clsx from 'clsx';
import { useId, useMemo } from 'react';
import { backgroundIds } from '@/entities/story/data/backgrounds';
import type { Story } from '@/entities/story/model/types';
import { validateStory, type StoryIssueSeverity } from '@/entities/story/model/validate-story';
import { getIssueMessage, getIssueNodeId, getIssueSummary, sortIssues } from '../../lib/story-issues';
import styles from './IssuesPanel.module.scss';

type IssuesPanelProps = {
	story: Story;
	onSelectNode: (nodeId: string) => void;
};

const severityLabels = {
	error: 'Error',
	warning: 'Warning',
} satisfies Record<StoryIssueSeverity, string>;

export function IssuesPanel({ story, onSelectNode }: IssuesPanelProps) {
	const headingId = useId();
	const issues = useMemo(() => sortIssues(validateStory(story, backgroundIds)), [story]);

	return (
		<section
			className={styles.panel}
			aria-labelledby={headingId}
		>
			<h2
				id={headingId}
				className={styles.heading}
			>
				Story check
			</h2>
			<p
				role='status'
				className={styles.summary}
			>
				{getIssueSummary(issues)}
			</p>

			{issues.length > 0 && (
				<details className={styles.details}>
					<summary className={styles.toggle}>Show problems</summary>
					<ul className={styles.list}>
						{issues.map((issue) => {
							const nodeId = getIssueNodeId(story, issue);
							const content = (
								<>
									<span className={clsx(styles.severity, styles[issue.severity])}>
										{severityLabels[issue.severity]}
									</span>{' '}
									<span className={styles.message}>{getIssueMessage(story, issue)}</span>
								</>
							);

							return (
								<li key={JSON.stringify(issue)}>
									{nodeId ? (
										<button
											type='button'
											className={clsx(styles.issue, styles.issueButton)}
											onClick={() => onSelectNode(nodeId)}
										>
											{content}
										</button>
									) : (
										<p className={styles.issue}>{content}</p>
									)}
								</li>
							);
						})}
					</ul>
				</details>
			)}
		</section>
	);
}
