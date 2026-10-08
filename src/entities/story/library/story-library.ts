import type { Story } from '../model/types';

const STORAGE_KEY = 'interactive-story-editor:stories';
const LIBRARY_VERSION = 1;

type StoredLibrary = {
	version: typeof LIBRARY_VERSION;
	stories: Story[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isStoryLike(value: unknown): value is Story {
	return (
		isRecord(value) &&
		typeof value.id === 'string' &&
		typeof value.title === 'string' &&
		typeof value.description === 'string' &&
		Array.isArray(value.nodes) &&
		Array.isArray(value.edges)
	);
}

export function parseLibrary(raw: string | null): Story[] {
	if (raw === null) {
		return [];
	}

	let data: unknown;

	try {
		data = JSON.parse(raw);
	} catch {
		return [];
	}

	if (!isRecord(data) || data.version !== LIBRARY_VERSION || !Array.isArray(data.stories)) {
		return [];
	}

	return data.stories.filter(isStoryLike);
}

export function serializeLibrary(stories: Story[]): string {
	const library: StoredLibrary = { version: LIBRARY_VERSION, stories };

	return JSON.stringify(library);
}

export function upsertStory(stories: Story[], story: Story): Story[] {
	return [story, ...stories.filter((current) => current.id !== story.id)];
}

export function removeStory(stories: Story[], id: string): Story[] {
	return stories.filter((story) => story.id !== id);
}

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedStories: Story[] = [];

function readRaw(): string | null {
	try {
		return window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

export function getStories(): Story[] {
	const raw = readRaw();

	if (raw !== cachedRaw) {
		cachedRaw = raw;
		cachedStories = parseLibrary(raw);
	}

	return cachedStories;
}

function writeStories(stories: Story[]): boolean {
	try {
		window.localStorage.setItem(STORAGE_KEY, serializeLibrary(stories));
	} catch {
		return false;
	}

	listeners.forEach((listener) => listener());

	return true;
}

export function saveStory(story: Story): boolean {
	return writeStories(upsertStory(getStories(), story));
}

export function deleteStory(id: string): boolean {
	return writeStories(removeStory(getStories(), id));
}

function handleStorage(event: StorageEvent) {
	if (event.key === STORAGE_KEY || event.key === null) {
		listeners.forEach((listener) => listener());
	}
}

export function subscribe(listener: () => void): () => void {
	if (listeners.size === 0) {
		window.addEventListener('storage', handleStorage);
	}

	listeners.add(listener);

	return () => {
		listeners.delete(listener);

		if (listeners.size === 0) {
			window.removeEventListener('storage', handleStorage);
		}
	};
}
