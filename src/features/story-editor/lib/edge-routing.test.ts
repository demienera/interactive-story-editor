import { Position } from '@xyflow/react';
import { describe, expect, test } from 'vitest';
import { getChoiceSide, getNodeSides, getSideAnchor, type Rect } from './edge-routing';

const source: Rect = { x: 0, y: 0, width: 200, height: 100 };

function at(x: number, y: number): Rect {
	return { x, y, width: 200, height: 100 };
}

describe('getNodeSides', () => {
	test('goes from bottom to top when the target is below', () => {
		expect(getNodeSides(source, at(0, 300))).toEqual({ sourceSide: Position.Bottom, targetSide: Position.Top });
	});

	test('goes from top to bottom when the target is above', () => {
		expect(getNodeSides(source, at(50, -300))).toEqual({ sourceSide: Position.Top, targetSide: Position.Bottom });
	});

	test('goes sideways when the nodes are side by side', () => {
		expect(getNodeSides(source, at(400, 40))).toEqual({ sourceSide: Position.Right, targetSide: Position.Left });
		expect(getNodeSides(source, at(-400, -40))).toEqual({ sourceSide: Position.Left, targetSide: Position.Right });
	});

	test('treats a target closer than the minimal gap as side by side', () => {
		expect(getNodeSides(source, at(400, 110))).toEqual({ sourceSide: Position.Right, targetSide: Position.Left });
	});
});

describe('getChoiceSide', () => {
	test('leaves from the right when the target is to the right or below', () => {
		expect(getChoiceSide(source, at(400, 0))).toBe(Position.Right);
		expect(getChoiceSide(source, at(0, 300))).toBe(Position.Right);
	});

	test('leaves from the left when the target is to the left of the scene', () => {
		expect(getChoiceSide(source, at(-400, 300))).toBe(Position.Left);
	});
});

describe('getSideAnchor', () => {
	test('returns the middle of each side', () => {
		expect(getSideAnchor(source, Position.Top)).toEqual({ x: 100, y: 0 });
		expect(getSideAnchor(source, Position.Bottom)).toEqual({ x: 100, y: 100 });
		expect(getSideAnchor(source, Position.Left)).toEqual({ x: 0, y: 50 });
		expect(getSideAnchor(source, Position.Right)).toEqual({ x: 200, y: 50 });
	});
});
