export type StoryNodeType = 'start' | 'scene' | 'choice' | 'ending';

export type StartNode = {
	id: string;
	type: 'start';
	title: string;
};

export type SceneNode = {
	id: string;
	type: 'scene';
	title: string;
	text: string;
};

export type Choice = {
	id: string;
	label: string;
};

export type ChoiceNode = {
	id: string;
	type: 'choice';
	title: string;
	choices: Choice[];
};

export type EndingNode = {
	id: string;
	type: 'ending';
	title: string;
	text: string;
};

export type StoryNode = StartNode | SceneNode | ChoiceNode | EndingNode;

export type StoryEdge = {
	id: string;
	source: string;
	target: string;
	choiceId?: string;
};

export type Story = {
	id: string;
	title: string;
	description: string;
	nodes: StoryNode[];
	edges: StoryEdge[];
};
