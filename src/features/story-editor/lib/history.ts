export type History<T> = {
	past: T[];
	present: T;
	future: T[];
};

const DEFAULT_LIMIT = 100;

export function createHistory<T>(present: T): History<T> {
	return { past: [], present, future: [] };
}

export function pushHistory<T>(history: History<T>, next: T, limit = DEFAULT_LIMIT): History<T> {
	return {
		past: [...history.past, history.present].slice(-limit),
		present: next,
		future: [],
	};
}

export function undo<T>(history: History<T>): History<T> {
	if (history.past.length === 0) {
		return history;
	}

	return {
		past: history.past.slice(0, -1),
		present: history.past[history.past.length - 1],
		future: [history.present, ...history.future],
	};
}

export function redo<T>(history: History<T>): History<T> {
	if (history.future.length === 0) {
		return history;
	}

	const [next, ...future] = history.future;

	return {
		past: [...history.past, history.present],
		present: next,
		future,
	};
}
