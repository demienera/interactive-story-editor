'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { demoStory } from '@/entities/story/data/demo-story';
import { getNextNode, getNextNodeByChoice, getStartNode } from '@/entities/story/model/story-engine';
import type { StoryNode } from '@/entities/story/model/types';
import playerBackground from '../../../../public/bg.jpg';
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

	const handleRestart = () => {
		setCurrentNode(getStartNode(demoStory));
	};

	return (
		<div className={styles.page}>
			<Image
				src={playerBackground}
				alt=''
				fill
				priority
				quality={90}
				placeholder='blur'
				sizes='100vw'
				className={styles.background}
			/>

			<header className={styles.header}>
				<nav aria-label='Story'>
					<Link
						href='/'
						className={styles.control}
					>
						<span aria-hidden='true'>←</span> Home
					</Link>
				</nav>
				<button
					type='button'
					className={styles.control}
					onClick={handleRestart}
				>
					Restart
				</button>
			</header>

			<main className={styles.player}>
				<div className={styles.card}>
					<p className={styles.storyTitle}>{demoStory.title}</p>

					<h1 className={styles.title}>{currentNode.title}</h1>

					{currentNode.type === 'scene' && <p className={styles.text}>{currentNode.text}</p>}
					{currentNode.type === 'ending' && <p className={styles.text}>{currentNode.text}</p>}
					{currentNode.type === 'start' && (
						<div className={styles.actions}>
							<button
								type='button'
								className={styles.button}
								onClick={handleContinue}
							>
								Begin story
							</button>
						</div>
					)}

					{currentNode.type === 'scene' && currentNode.choices.length === 0 && (
						<div className={styles.actions}>
							<button
								type='button'
								className={styles.button}
								onClick={handleContinue}
							>
								Continue
							</button>
						</div>
					)}

					{currentNode.type === 'scene' && currentNode.choices.length > 0 && (
						<div className={styles.actions}>
							{currentNode.choices.map((choice) => (
								<button
									key={choice.id}
									type='button'
									className={styles.button}
									onClick={() => handleChoice(choice.id)}
								>
									{choice.label}
								</button>
							))}
						</div>
					)}

					{currentNode.type === 'ending' && (
						<>
							<p className={styles.ending}>The End</p>
							<div className={styles.actions}>
								<button
									type='button'
									className={styles.button}
									onClick={handleRestart}
								>
									Play again
								</button>
								<Link
									href='/'
									className={styles.button}
								>
									Back to home
								</Link>
							</div>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
