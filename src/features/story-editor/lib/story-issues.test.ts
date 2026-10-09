import { describe, expect, test } from 'vitest';
import type { Story } from '@/entities/story/model/types';
import type { StoryIssue } from '@/entities/story/model/validate-story';
import { getIssueMessage, getIssueNodeId, getIssueSummary, sortIssues } from './story-issues';

function createStory(): Story {
	return {
		id: 'test-story',
		title: 'Test Story',
		description: '',
		nodes: [
			{ id: 'start', type: 'start', title: 'Start' },
			{
				id: 'gate',
				type: 'scene',
				title: 'The Gate',
				text: 'Two paths lead away from the gate.',
				choices: [{ id: 'go-left', label: 'Go left' }],
			},
			{ id: 'left-end', type: 'ending', title: 'Left End', text: 'You went left.' },
		],
		edges: [
			{ id: 'start-to-gate', type: 'continue', source: 'start', target: 'gate' },
			{ id: 'gate-left', type: 'choice', source: 'gate', target: 'left-end', choiceId: 'go-left' },
			{ id: 'from-ending', type: 'continue', source: 'left-end', target: 'gate' },
			{ id: 'to-nowhere', type: 'continue', source: 'gate', target: 'deleted' },
			{ id: 'from-nowhere', type: 'continue', source: 'deleted', target: 'gate' },
		],
	};
}

describe('getIssueMessage', () => {
	const story = createStory();

	test.each<[StoryIssue, string]>([
		[{ code: 'missing-start', severity: 'error' }, 'The story has no start node.'],
		[
			{ code: 'multiple-starts', severity: 'error', nodeIds: ['start', 'start-2'] },
			'The story has 2 start nodes; keep only one.',
		],
		[{ code: 'dead-end', severity: 'error', nodeId: 'start' }, '"Start" has no next node.'],
		[
			{ code: 'missing-choice-edge', severity: 'error', nodeId: 'gate', choiceId: 'go-left' },
			'Choice "Go left" in "The Gate" leads nowhere.',
		],
		[
			{ code: 'missing-node', severity: 'error', edgeId: 'to-nowhere', nodeId: 'deleted' },
			'A connection from "The Gate" points to a missing node.',
		],
		[
			{ code: 'missing-node', severity: 'error', edgeId: 'from-nowhere', nodeId: 'deleted' },
			'A connection points to a missing node.',
		],
		[
			{ code: 'unknown-choice', severity: 'error', edgeId: 'gate-left', choiceId: 'removed' },
			'A connection from "The Gate" belongs to a removed choice.',
		],
		[{ code: 'ignored-edge', severity: 'warning', edgeId: 'from-ending' }, 'A connection from "Left End" is never used.'],
		[
			{ code: 'unreachable-node', severity: 'warning', nodeId: 'left-end' },
			'"Left End" cannot be reached from the start.',
		],
		[
			{ code: 'unknown-background', severity: 'warning', nodeId: 'left-end', background: 'old-cave' },
			'"Left End" uses a background that no longer exists.',
		],
	])('describes %o', (issue, message) => {
		expect(getIssueMessage(story, issue)).toBe(message);
	});

	test('falls back to ids when the node or choice is missing', () => {
		expect(
			getIssueMessage(story, { code: 'missing-choice-edge', severity: 'error', nodeId: 'gone', choiceId: 'old-choice' }),
		).toBe('Choice "old-choice" in "gone" leads nowhere.');
	});
});

describe('getIssueNodeId', () => {
	const story = createStory();

	test('returns no node for a missing start', () => {
		expect(getIssueNodeId(story, { code: 'missing-start', severity: 'error' })).toBeUndefined();
	});

	test('returns the first start node for multiple starts', () => {
		expect(getIssueNodeId(story, { code: 'multiple-starts', severity: 'error', nodeIds: ['start', 'start-2'] })).toBe(
			'start',
		);
	});

	test('returns the node of a node issue', () => {
		expect(getIssueNodeId(story, { code: 'dead-end', severity: 'error', nodeId: 'gate' })).toBe('gate');
	});

	test('returns the source node of an edge issue', () => {
		expect(getIssueNodeId(story, { code: 'ignored-edge', severity: 'warning', edgeId: 'from-ending' })).toBe(
			'left-end',
		);
	});

	test('returns no node when the edge source does not exist', () => {
		expect(
			getIssueNodeId(story, { code: 'missing-node', severity: 'error', edgeId: 'from-nowhere', nodeId: 'deleted' }),
		).toBeUndefined();
	});
});

describe('getIssueSummary', () => {
	const error: StoryIssue = { code: 'missing-start', severity: 'error' };
	const warning: StoryIssue = { code: 'unreachable-node', severity: 'warning', nodeId: 'gate' };

	test('reports a story without problems', () => {
		expect(getIssueSummary([])).toBe('No problems found');
	});

	test('counts errors and warnings', () => {
		expect(getIssueSummary([error, warning, warning])).toBe('1 error, 2 warnings');
	});

	test('omits a severity with no issues', () => {
		expect(getIssueSummary([warning])).toBe('1 warning');
		expect(getIssueSummary([error, error])).toBe('2 errors');
	});
});

describe('sortIssues', () => {
	test('puts errors first and keeps the order inside each group', () => {
		const first: StoryIssue = { code: 'unreachable-node', severity: 'warning', nodeId: 'a' };
		const second: StoryIssue = { code: 'dead-end', severity: 'error', nodeId: 'b' };
		const third: StoryIssue = { code: 'unreachable-node', severity: 'warning', nodeId: 'c' };
		const fourth: StoryIssue = { code: 'dead-end', severity: 'error', nodeId: 'd' };

		expect(sortIssues([first, second, third, fourth])).toEqual([second, fourth, first, third]);
	});
});
