import { getNode } from '@/entities/story/model/story-engine';
import type { Story } from '@/entities/story/model/types';
import type { StoryIssue } from '@/entities/story/model/validate-story';

function getTitle(story: Story, nodeId: string): string {
	return getNode(story, nodeId)?.title ?? nodeId;
}

function getChoiceLabel(story: Story, nodeId: string, choiceId: string): string {
	const node = getNode(story, nodeId);
	const choice = node?.type === 'scene' ? node.choices.find((item) => item.id === choiceId) : undefined;

	return choice?.label ?? choiceId;
}

function getEdgeSourceId(story: Story, edgeId: string): string | undefined {
	const sourceId = story.edges.find((edge) => edge.id === edgeId)?.source;

	return sourceId && getNode(story, sourceId) ? sourceId : undefined;
}

function describeEdgeSource(story: Story, edgeId: string): string {
	const sourceId = getEdgeSourceId(story, edgeId);

	return sourceId ? `A connection from "${getTitle(story, sourceId)}"` : 'A connection';
}

export function getIssueMessage(story: Story, issue: StoryIssue): string {
	switch (issue.code) {
		case 'missing-start':
			return 'The story has no start node.';
		case 'multiple-starts':
			return `The story has ${issue.nodeIds.length} start nodes; keep only one.`;
		case 'dead-end':
			return `"${getTitle(story, issue.nodeId)}" has no next node.`;
		case 'missing-choice-edge':
			return `Choice "${getChoiceLabel(story, issue.nodeId, issue.choiceId)}" in "${getTitle(story, issue.nodeId)}" leads nowhere.`;
		case 'missing-node':
			return `${describeEdgeSource(story, issue.edgeId)} points to a missing node.`;
		case 'unknown-choice':
			return `${describeEdgeSource(story, issue.edgeId)} belongs to a removed choice.`;
		case 'ignored-edge':
			return `${describeEdgeSource(story, issue.edgeId)} is never used.`;
		case 'unreachable-node':
			return `"${getTitle(story, issue.nodeId)}" cannot be reached from the start.`;
		case 'unknown-background':
			return `"${getTitle(story, issue.nodeId)}" uses a background that no longer exists.`;
	}
}

export function getIssueNodeId(story: Story, issue: StoryIssue): string | undefined {
	switch (issue.code) {
		case 'missing-start':
			return undefined;
		case 'multiple-starts':
			return issue.nodeIds[0];
		case 'dead-end':
		case 'missing-choice-edge':
		case 'unreachable-node':
		case 'unknown-background':
			return issue.nodeId;
		case 'missing-node':
		case 'unknown-choice':
		case 'ignored-edge':
			return getEdgeSourceId(story, issue.edgeId);
	}
}

function pluralize(count: number, word: string): string {
	return `${count} ${count === 1 ? word : `${word}s`}`;
}

export function getIssueSummary(issues: StoryIssue[]): string {
	const errors = issues.filter((issue) => issue.severity === 'error').length;
	const warnings = issues.length - errors;

	if (issues.length === 0) {
		return 'No problems found';
	}

	return [errors > 0 && pluralize(errors, 'error'), warnings > 0 && pluralize(warnings, 'warning')]
		.filter(Boolean)
		.join(', ');
}

export function sortIssues(issues: StoryIssue[]): StoryIssue[] {
	return [
		...issues.filter((issue) => issue.severity === 'error'),
		...issues.filter((issue) => issue.severity === 'warning'),
	];
}
