'use client';

import clsx from 'clsx';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useEntries } from '../lib/use-story-library';
import { ExampleStories } from './ExampleStories';
import { MyStories } from './MyStories';
import styles from './StoryLibrary.module.scss';

type LibraryTab = 'examples' | 'mine';

const TABS: LibraryTab[] = ['examples', 'mine'];

const tabLabels = {
	mine: 'My stories',
	examples: 'Examples',
} satisfies Record<LibraryTab, string>;

function getNextTab(current: LibraryTab, key: string): LibraryTab | undefined {
	const index = TABS.indexOf(current);

	switch (key) {
		case 'ArrowRight':
			return TABS[(index + 1) % TABS.length];
		case 'ArrowLeft':
			return TABS[(index - 1 + TABS.length) % TABS.length];
		case 'Home':
			return TABS[0];
		case 'End':
			return TABS[TABS.length - 1];
		default:
			return undefined;
	}
}

export function LibraryTabs() {
	const entries = useEntries();
	const [chosenTab, setChosenTab] = useState<LibraryTab | null>(null);
	const baseId = useId();
	const tabRefs = useRef<Partial<Record<LibraryTab, HTMLButtonElement | null>>>({});
	const myStoriesPanelRef = useRef<HTMLDivElement>(null);
	const selectedTab = chosenTab ?? (entries && entries.length > 0 ? 'mine' : 'examples');

	const selectTab = (tab: LibraryTab, moveFocus: boolean) => {
		setChosenTab(tab);

		if (moveFocus) {
			tabRefs.current[tab]?.focus();
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const next = getNextTab(selectedTab, event.key);

		if (next) {
			event.preventDefault();
			selectTab(next, true);
		}
	};

	return (
		<section
			className={styles.library}
			aria-labelledby={`${baseId}-heading`}
		>
			<h2
				id={`${baseId}-heading`}
				className={styles.visuallyHidden}
			>
				Story library
			</h2>
			<div
				role='tablist'
				aria-label='Story library'
				className={styles.tabs}
				onKeyDown={handleKeyDown}
			>
				{TABS.map((tab) => (
					<button
						key={tab}
						ref={(element) => {
							tabRefs.current[tab] = element;
						}}
						type='button'
						role='tab'
						id={`${baseId}-${tab}-tab`}
						aria-selected={selectedTab === tab}
						aria-controls={`${baseId}-${tab}-panel`}
						tabIndex={selectedTab === tab ? 0 : -1}
						className={clsx(styles.tab, { [styles.selectedTab]: selectedTab === tab })}
						onClick={() => selectTab(tab, false)}
					>
						{tabLabels[tab]}
						{tab === 'mine' && entries && entries.length > 0 && <span className={styles.count}>{entries.length}</span>}
					</button>
				))}
			</div>

			<div
				role='tabpanel'
				id={`${baseId}-examples-panel`}
				aria-labelledby={`${baseId}-examples-tab`}
				hidden={selectedTab !== 'examples'}
				className={styles.panel}
			>
				<ExampleStories />
			</div>
			<div
				ref={myStoriesPanelRef}
				role='tabpanel'
				id={`${baseId}-mine-panel`}
				aria-labelledby={`${baseId}-mine-tab`}
				tabIndex={-1}
				hidden={selectedTab !== 'mine'}
				className={styles.panel}
			>
				<MyStories
					onDeleted={() => {
						setChosenTab('mine');
						myStoriesPanelRef.current?.focus();
					}}
				/>
			</div>
		</section>
	);
}
