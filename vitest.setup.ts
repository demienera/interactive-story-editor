import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
	cleanup();
});

// jsdom has no layout engine; React Flow needs these APIs to mount.
// https://reactflow.dev/learn/advanced-use/testing
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}

class DOMMatrixReadOnlyStub {
	m22: number;

	constructor(transform?: string) {
		const scale = transform?.match(/scale\(([0-9.]+)\)/)?.[1];
		this.m22 = scale === undefined ? 1 : Number(scale);
	}
}

globalThis.ResizeObserver ??= ResizeObserverStub;
globalThis.DOMMatrixReadOnly ??= DOMMatrixReadOnlyStub as unknown as typeof DOMMatrixReadOnly;

Object.defineProperties(HTMLElement.prototype, {
	offsetWidth: {
		configurable: true,
		get() {
			return Number.parseFloat(this.style.width) || 1;
		},
	},
	offsetHeight: {
		configurable: true,
		get() {
			return Number.parseFloat(this.style.height) || 1;
		},
	},
});
