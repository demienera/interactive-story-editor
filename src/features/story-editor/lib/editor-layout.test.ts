import type { NodeChange } from '@xyflow/react';
import { describe, expect, test } from 'vitest';
import { applyPositionChanges, applySizeChanges, removeNodeFromLayout, type EditorLayout } from './editor-layout';

function createLayout(): EditorLayout {
	return {
		start: { x: 0, y: 0 },
		gate: { x: 0, y: 260 },
	};
}

describe('applyPositionChanges', () => {
	test('moves the dragged node and keeps other positions', () => {
		const layout = createLayout();
		const result = applyPositionChanges(layout, [
			{ id: 'gate', type: 'position', position: { x: 120, y: 300 }, dragging: true },
		]);

		expect(result).toEqual({
			start: { x: 0, y: 0 },
			gate: { x: 120, y: 300 },
		});
		expect(result.start).toBe(layout.start);
	});

	test('applies several position changes in order', () => {
		const result = applyPositionChanges(createLayout(), [
			{ id: 'gate', type: 'position', position: { x: 10, y: 10 } },
			{ id: 'gate', type: 'position', position: { x: 20, y: 20 } },
		]);

		expect(result.gate).toEqual({ x: 20, y: 20 });
	});

	test('returns the same layout when there are no position changes', () => {
		const layout = createLayout();
		const changes: NodeChange[] = [
			{ id: 'gate', type: 'select', selected: true },
			{ id: 'gate', type: 'dimensions', dimensions: { width: 220, height: 120 } },
			{ id: 'gate', type: 'position', dragging: false },
		];

		expect(applyPositionChanges(layout, changes)).toBe(layout);
	});

	test('does not mutate the original layout', () => {
		const layout = createLayout();
		const before = structuredClone(layout);

		applyPositionChanges(layout, [{ id: 'gate', type: 'position', position: { x: 120, y: 300 } }]);

		expect(layout).toEqual(before);
	});
});

describe('applySizeChanges', () => {
	test('stores measured sizes', () => {
		const result = applySizeChanges({}, [
			{ id: 'gate', type: 'dimensions', dimensions: { width: 220, height: 120 } },
			{ id: 'start', type: 'dimensions', dimensions: { width: 220, height: 60 } },
		]);

		expect(result).toEqual({
			gate: { width: 220, height: 120 },
			start: { width: 220, height: 60 },
		});
	});

	test('returns the same sizes when there are no measured dimensions', () => {
		const sizes = { gate: { width: 220, height: 120 } };
		const changes: NodeChange[] = [
			{ id: 'gate', type: 'position', position: { x: 0, y: 0 } },
			{ id: 'gate', type: 'dimensions', resizing: false },
		];

		expect(applySizeChanges(sizes, changes)).toBe(sizes);
	});
});

describe('removeNodeFromLayout', () => {
	test('removes only the deleted node', () => {
		expect(removeNodeFromLayout(createLayout(), 'gate')).toEqual({ start: { x: 0, y: 0 } });
	});

	test('does not mutate the original record', () => {
		const layout = createLayout();
		const before = structuredClone(layout);

		removeNodeFromLayout(layout, 'gate');

		expect(layout).toEqual(before);
	});

	test('returns the same record when the node has no entry', () => {
		const layout = createLayout();

		expect(removeNodeFromLayout(layout, 'unknown')).toBe(layout);
	});
});
