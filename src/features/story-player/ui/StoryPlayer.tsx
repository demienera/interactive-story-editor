'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getNextNode, getNextNodeByChoice, getStartNode } from '@/entities/story/model/story-engine';
import type { Story, StoryNode } from '@/entities/story/model/types';
import playerBackground from '../../../../public/bg.jpg';
import styles from './StoryPlayer.module.scss';

type StoryPlayerProps = {
	story: Story;
};

export function StoryPlayer({ story }: StoryPlayerProps) {
	const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(getStartNode(story));
	const titleRef = useRef<HTMLHeadingElement>(null);
	const shouldFocusTitle = useRef(false);

	useEffect(() => {
		if (!shouldFocusTitle.current) {
			return;
		}

		shouldFocusTitle.current = false;
		titleRef.current?.focus();
	}, [currentNode]);

	if (!currentNode) {
		return <p>Story has no start node.</p>;
	}

	const goTo = (node: StoryNode | undefined) => {
		shouldFocusTitle.current = true;
		setCurrentNode(node);
	};

	const handleContinue = () => {
		goTo(getNextNode(story, currentNode.id));
	};

	const handleChoice = (choiceId: string) => {
		goTo(getNextNodeByChoice(story, currentNode.id, choiceId));
	};

	const handleRestart = () => {
		goTo(getStartNode(story));
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
					<p className={styles.storyTitle}>{story.title}</p>

					<h1
						ref={titleRef}
						tabIndex={-1}
						className={styles.title}
					>
						{currentNode.title}
					</h1>

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
