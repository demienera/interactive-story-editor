export type StartNode = {
	id: string;
	type: 'start';
	title: string;
	background?: string;
};

export type Choice = {
	id: string;
	label: string;
};

export type SceneNode = {
	id: string;
	type: 'scene';
	title: string;
	text: string;
	choices: Choice[];
	background?: string;
};

export type EndingNode = {
	id: string;
	type: 'ending';
	title: string;
	text: string;
	background?: string;
};

export type StoryNode = StartNode | SceneNode | EndingNode;

export type StoryNodeType = StoryNode['type'];

export type ContinueEdge = {
	id: string;
	type: 'continue';
	source: string;
	target: string;
};

export type ChoiceEdge = {
	id: string;
	type: 'choice';
	source: string;
	target: string;
	choiceId: string;
};

export type StoryEdge = ContinueEdge | ChoiceEdge;

export type Story = {
	id: string;
	title: string;
	description: string;
	nodes: StoryNode[];
	edges: StoryEdge[];
};
