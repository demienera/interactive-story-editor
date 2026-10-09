'use client';

import clsx from 'clsx';
import Image, { getImageProps, type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { getBackground } from '@/entities/story/data/backgrounds';
import { getNextNode, getNextNodeByChoice, getStartNode } from '@/entities/story/model/story-engine';
import type { Story, StoryNode } from '@/entities/story/model/types';
import playerBackground from '../../../../public/bg.jpg';
import {
	DEFAULT_BACKGROUND,
	getNodeBackground,
	getSceneBackground,
	getUpcomingNodes,
	showBackground,
	type BackgroundLayer,
} from '../lib/scene-background';
import { useTypewriter } from '../lib/typewriter';
import styles from './StoryPlayer.module.scss';

const BACKGROUND_SIZES = '100vw';
const BACKGROUND_QUALITY = 90;

function getBackgroundSrc(background: string): StaticImageData | string {
	return getBackground(background)?.src ?? playerBackground;
}

function getStartBackground(story: Story): string {
	const start = getStartNode(story);

	return start ? getSceneBackground(DEFAULT_BACKGROUND, start) : DEFAULT_BACKGROUND;
}

type StoryPlayerProps = {
	story: Story;
};

export function StoryPlayer({ story }: StoryPlayerProps) {
	const [currentNode, setCurrentNode] = useState<StoryNode | undefined>(getStartNode(story));
	const [backgroundLayers, setBackgroundLayers] = useState<BackgroundLayer[]>(() =>
		showBackground([], getStartBackground(story)),
	);
	const titleId = useId();
	const titleRef = useRef<HTMLHeadingElement>(null);
	const shouldFocusTitle = useRef(false);
	const text = currentNode && currentNode.type !== 'start' ? currentNode.text : '';
	const { typed, rest, isTyping, complete } = useTypewriter(text);

	const completeOnKey = useEffectEvent((event: KeyboardEvent) => {
		if (isTyping && !event.repeat) {
			complete();
		}
	});

	useEffect(() => {
		document.addEventListener('keydown', completeOnKey);

		return () => document.removeEventListener('keydown', completeOnKey);
	}, []);

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

	for (const next of getUpcomingNodes(story, currentNode)) {
		const background = getNodeBackground(next);

		if (background) {
			preloadBackground(getBackgroundSrc(background));
		}
	}

	const goTo = (node: StoryNode | undefined) => {
		shouldFocusTitle.current = true;
		setCurrentNode(node);

		if (node) {
			setBackgroundLayers((layers) =>
				showBackground(layers, getSceneBackground(layers[layers.length - 1].background, node)),
			);
		}
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
			{backgroundLayers.map((layer, index) => {
				const src = getBackgroundSrc(layer.background);

				return (
					<Image
						key={layer.key}
						src={src}
						alt=''
						fill
						priority={layer.key === 0}
						quality={BACKGROUND_QUALITY}
						placeholder={typeof src === 'string' ? 'empty' : 'blur'}
						unoptimized={typeof src === 'string'}
						sizes={BACKGROUND_SIZES}
						className={clsx(styles.background, index > 0 && styles.entering)}
						onLoad={(event) => {
							event.currentTarget.dataset.loaded = 'true';
						}}
					/>
				);
			})}

			<header className={styles.header}>
				<nav aria-label='Story'>
					<Link
						href='/'
						className={styles.control}
					>
						<span aria-hidden='true'>←</span> Home
					</Link>
				</nav>
				<p className={styles.storyTitle}>{story.title}</p>
				<button
					type='button'
					className={styles.control}
					onClick={handleRestart}
				>
					Restart
				</button>
			</header>

			<main className={styles.player}>
				<section
					className={styles.window}
					aria-labelledby={titleId}
					data-typing={isTyping || undefined}
					onClick={isTyping ? complete : undefined}
				>
					<h1
						ref={titleRef}
						id={titleId}
						tabIndex={-1}
						className={styles.title}
					>
						{currentNode.title}
					</h1>

					{text && (
						<p className={styles.text}>
							{typed}
							<span className={styles.untyped}>{rest}</span>
						</p>
					)}

					{currentNode.type === 'start' && (
						<div className={styles.actions}>
							<button
								type='button'
								className={styles.next}
								onClick={handleContinue}
							>
								Begin story <span
									aria-hidden='true'
									className={styles.indicator}
								>
									▼
								</span>
							</button>
						</div>
					)}

					{currentNode.type === 'scene' && currentNode.choices.length === 0 && (
						<div className={styles.actions}>
							<button
								type='button'
								className={styles.next}
								onClick={handleContinue}
							>
								Continue <span
									aria-hidden='true'
									className={styles.indicator}
								>
									▼
								</span>
							</button>
						</div>
					)}

					{currentNode.type === 'scene' && currentNode.choices.length > 0 && (
						<div className={clsx(styles.actions, styles.choices)}>
							{currentNode.choices.map((choice) => (
								<button
									key={choice.id}
									type='button'
									className={styles.choice}
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
							<div className={clsx(styles.actions, styles.endingActions)}>
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
				</section>
			</main>
		</div>
	);
}

function preloadBackground(src: StaticImageData | string) {
	const { props } = getImageProps({
		src,
		alt: '',
		fill: true,
		sizes: BACKGROUND_SIZES,
		quality: BACKGROUND_QUALITY,
		unoptimized: typeof src === 'string',
	});

	preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: BACKGROUND_SIZES });
}
