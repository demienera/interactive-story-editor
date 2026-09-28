'use client';

import { useState } from 'react';
import { demoStory } from '@/entities/story/data/demo-story';
import { getNextNode, getNextNodeByChoice, getStartNode } from '@/entities/story/model/story-engine';
import type { StoryNode } from '@/entities/story/model/types';
import styles from './StoryPlayer.module.scss';

export function StoryPlayer() {
	const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(getStartNode(demoStory));

	if (!currentNode) {
		return <p>Story has no start node.</p>;
	}

	const handleContinue = () => {
		const nextNode = getNextNode(demoStory, currentNode.id);

		setCurrentNode(nextNode);
	};

	const handleChoice = (choiceId: string) => {
		const nextNode = getNextNodeByChoice(demoStory, currentNode.id, choiceId);

		setCurrentNode(nextNode);
	};

	return (
		<main className={styles.player}>
			<div className={styles.card}>
				<p className={styles.storyTitle}>{demoStory.title}</p>

				<h1>{currentNode.title}</h1>

				{currentNode.type === 'scene' && <p>{currentNode.text}</p>}
				{currentNode.type === 'ending' && <p>{currentNode.text}</p>}
				{currentNode.type === 'start' && (
					<button
						type='button'
						onClick={handleContinue}
					>
						Begin story
					</button>
				)}

				{currentNode.type === 'scene' && (
					<button
						type='button'
						onClick={handleContinue}
					>
						Continue
					</button>
				)}

				{currentNode.type === 'choice' && (
					<div className={styles.choices}>
						{currentNode.choices.map((choice) => (
							<button
								key={choice.id}
								type='button'
								onClick={() => handleChoice(choice.id)}
							>
								{choice.label}
							</button>
						))}
					</div>
				)}

				{currentNode.type === 'ending' && <p className={styles.ending}>The End</p>}
			</div>
		</main>
	);
}
