import type { Story, StoryNode } from './types';

export type StoryIssue =
	| { code: 'missing-start'; severity: 'error' }
	| { code: 'multiple-starts'; severity: 'error'; nodeIds: string[] }
	| { code: 'dead-end'; severity: 'error'; nodeId: string }
	| { code: 'missing-choice-edge'; severity: 'error'; nodeId: string; choiceId: string }
	| { code: 'missing-node'; severity: 'error'; edgeId: string; nodeId: string }
	| { code: 'unknown-choice'; severity: 'error'; edgeId: string; choiceId: string }
	| { code: 'ignored-edge'; severity: 'warning'; edgeId: string }
	| { code: 'unreachable-node'; severity: 'warning'; nodeId: string };

export type StoryIssueSeverity = StoryIssue['severity'];

export function validateStory(story: Story): StoryIssue[] {
	const nodesById = new Map(story.nodes.map((node) => [node.id, node]));

	return [
		...checkStart(story),
		...story.nodes.flatMap((node) => checkExits(story, node)),
		...checkEdges(story, nodesById),
		...checkReachability(story, nodesById),
	];
}

function checkStart(story: Story): StoryIssue[] {
	const startIds = story.nodes.filter((node) => node.type === 'start').map((node) => node.id);

	if (startIds.length === 0) {
		return [{ code: 'missing-start', severity: 'error' }];
	}

	if (startIds.length > 1) {
		return [{ code: 'multiple-starts', severity: 'error', nodeIds: startIds }];
	}

	return [];
}

function checkExits(story: Story, node: StoryNode): StoryIssue[] {
	if (node.type === 'ending') {
		return [];
	}

	if (node.type === 'scene' && node.choices.length > 0) {
		return node.choices
			.filter(
				(choice) =>
					!story.edges.some((edge) => edge.type === 'choice' && edge.source === node.id && edge.choiceId === choice.id),
			)
			.map(
				(choice): StoryIssue => ({
					code: 'missing-choice-edge',
					severity: 'error',
					nodeId: node.id,
					choiceId: choice.id,
				}),
			);
	}

	const hasContinue = story.edges.some((edge) => edge.type === 'continue' && edge.source === node.id);

	return hasContinue ? [] : [{ code: 'dead-end', severity: 'error', nodeId: node.id }];
}

function checkEdges(story: Story, nodesById: Map<string, StoryNode>): StoryIssue[] {
	const issues: StoryIssue[] = [];
	const usedTransitions = new Set<string>();

	for (const edge of story.edges) {
		const source = nodesById.get(edge.source);

		if (!source) {
			issues.push({ code: 'missing-node', severity: 'error', edgeId: edge.id, nodeId: edge.source });
		}

		if (!nodesById.has(edge.target)) {
			issues.push({ code: 'missing-node', severity: 'error', edgeId: edge.id, nodeId: edge.target });
		}

		if (!source) {
			continue;
		}

		if (source.type === 'ending') {
			issues.push({ code: 'ignored-edge', severity: 'warning', edgeId: edge.id });
			continue;
		}

		if (
			edge.type === 'choice' &&
			(source.type !== 'scene' || !source.choices.some((choice) => choice.id === edge.choiceId))
		) {
			issues.push({ code: 'unknown-choice', severity: 'error', edgeId: edge.id, choiceId: edge.choiceId });
			continue;
		}

		const hasChoices = source.type === 'scene' && source.choices.length > 0;
		const transition = edge.type === 'choice' ? `${edge.source}:choice:${edge.choiceId}` : `${edge.source}:continue`;

		if ((edge.type === 'continue' && hasChoices) || usedTransitions.has(transition)) {
			issues.push({ code: 'ignored-edge', severity: 'warning', edgeId: edge.id });
			continue;
		}

		usedTransitions.add(transition);
	}

	return issues;
}

function checkReachability(story: Story, nodesById: Map<string, StoryNode>): StoryIssue[] {
	const startIds = story.nodes.filter((node) => node.type === 'start').map((node) => node.id);

	if (startIds.length === 0) {
		return [];
	}

	const reached = new Set(startIds);
	const queue = [...startIds];

	for (const nodeId of queue) {
		for (const edge of story.edges) {
			if (edge.source === nodeId && nodesById.has(edge.target) && !reached.has(edge.target)) {
				reached.add(edge.target);
				queue.push(edge.target);
			}
		}
	}

	return story.nodes
		.filter((node) => !reached.has(node.id))
		.map((node): StoryIssue => ({ code: 'unreachable-node', severity: 'warning', nodeId: node.id }));
}
