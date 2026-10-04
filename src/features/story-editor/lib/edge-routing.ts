import { Position, type XYPosition } from '@xyflow/react';

export type Rect = { x: number; y: number; width: number; height: number };

const MIN_VERTICAL_GAP = 20;

function centerX(rect: Rect): number {
	return rect.x + rect.width / 2;
}

export function getNodeSides(source: Rect, target: Rect): { sourceSide: Position; targetSide: Position } {
	if (target.y >= source.y + source.height + MIN_VERTICAL_GAP) {
		return { sourceSide: Position.Bottom, targetSide: Position.Top };
	}

	if (target.y + target.height + MIN_VERTICAL_GAP <= source.y) {
		return { sourceSide: Position.Top, targetSide: Position.Bottom };
	}

	return centerX(target) >= centerX(source)
		? { sourceSide: Position.Right, targetSide: Position.Left }
		: { sourceSide: Position.Left, targetSide: Position.Right };
}

export function getChoiceSide(source: Rect, target: Rect): Position {
	return centerX(target) < source.x ? Position.Left : Position.Right;
}

export function getSideAnchor(rect: Rect, side: Position): XYPosition {
	switch (side) {
		case Position.Top:
			return { x: centerX(rect), y: rect.y };
		case Position.Bottom:
			return { x: centerX(rect), y: rect.y + rect.height };
		case Position.Left:
			return { x: rect.x, y: rect.y + rect.height / 2 };
		case Position.Right:
			return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
	}
}
