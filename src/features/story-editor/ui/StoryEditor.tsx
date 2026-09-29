'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import { demoStory } from '@/entities/story/data/demo-story';
import { layoutByDepth } from '../lib/auto-layout';
import { storyToFlow } from '../lib/story-to-flow';
import { nodeTypes } from './nodes/node-types';
import '@xyflow/react/dist/style.css';
import styles from './StoryEditor.module.scss';

export function StoryEditor() {
	const { nodes, edges } = useMemo(() => storyToFlow(demoStory, layoutByDepth(demoStory)), []);

	return (
		<div className={styles.layout}>
			<header className={styles.toolbar}>
				<nav aria-label='Editor'>
					<Link
						href='/'
						className={styles.control}
					>
						<span aria-hidden='true'>←</span> Home
					</Link>
				</nav>
				<h1 className={styles.title}>{demoStory.title}</h1>
				<Link
					href='/play'
					className={styles.control}
				>
					Play story
				</Link>
			</header>

			<main className={styles.editor}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					fitView
				>
					<Background />
					<Controls />
				</ReactFlow>
			</main>
		</div>
	);
}
