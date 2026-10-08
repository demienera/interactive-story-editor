import type { Story } from '../model/types';

export type StoryLayout = Record<string, { x: number; y: number }>;

export type LibraryEntry = {
	story: Story;
	layout: StoryLayout;
};

const STORAGE_KEY = 'interactive-story-editor:stories';
const LIBRARY_VERSION = 2;

type StoredLibrary = {
	version: typeof LIBRARY_VERSION;
	entries: LibraryEntry[];
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

function isPosition(value: unknown): value is { x: number; y: number } {
	return isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y);
}

function parseLayout(value: unknown): StoryLayout {
	if (!isRecord(value) || Array.isArray(value)) {
		return {};
	}

	const layout: StoryLayout = {};

	for (const [nodeId, position] of Object.entries(value)) {
		if (!isPosition(position)) {
			return {};
		}

		layout[nodeId] = { x: position.x, y: position.y };
	}

	return layout;
}

function parseEntries(data: Record<string, unknown>): LibraryEntry[] {
	if (data.version === 1 && Array.isArray(data.stories)) {
		return data.stories.filter(isStoryLike).map((story) => ({ story, layout: {} }));
	}

	if (data.version === LIBRARY_VERSION && Array.isArray(data.entries)) {
		return data.entries.flatMap((entry: unknown) =>
			isRecord(entry) && isStoryLike(entry.story) ? [{ story: entry.story, layout: parseLayout(entry.layout) }] : [],
		);
	}

	return [];
}

export function parseLibrary(raw: string | null): LibraryEntry[] {
	if (raw === null) {
		return [];
	}

	let data: unknown;

	try {
		data = JSON.parse(raw);
	} catch {
		return [];
	}

	return isRecord(data) ? parseEntries(data) : [];
}

export function serializeLibrary(entries: LibraryEntry[]): string {
	const library: StoredLibrary = { version: LIBRARY_VERSION, entries };

	return JSON.stringify(library);
}

export function pruneLayout(story: Story, layout: StoryLayout): StoryLayout {
	const pruned: StoryLayout = {};

	for (const node of story.nodes) {
		if (layout[node.id]) {
			pruned[node.id] = layout[node.id];
		}
	}

	return pruned;
}

export function upsertEntry(entries: LibraryEntry[], entry: LibraryEntry): LibraryEntry[] {
	return [entry, ...entries.filter((current) => current.story.id !== entry.story.id)];
}

export function removeEntry(entries: LibraryEntry[], id: string): LibraryEntry[] {
	return entries.filter((entry) => entry.story.id !== id);
}

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedEntries: LibraryEntry[] = [];

function readRaw(): string | null {
	try {
		return window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

export function getEntries(): LibraryEntry[] {
	const raw = readRaw();

	if (raw !== cachedRaw) {
		cachedRaw = raw;
		cachedEntries = parseLibrary(raw);
	}

	return cachedEntries;
}

function writeEntries(entries: LibraryEntry[]): boolean {
	try {
		window.localStorage.setItem(STORAGE_KEY, serializeLibrary(entries));
	} catch {
		return false;
	}

	listeners.forEach((listener) => listener());

	return true;
}

export function saveStory(story: Story, layout: StoryLayout): boolean {
	return writeEntries(upsertEntry(getEntries(), { story, layout: pruneLayout(story, layout) }));
}

export function deleteStory(id: string): boolean {
	return writeEntries(removeEntry(getEntries(), id));
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
