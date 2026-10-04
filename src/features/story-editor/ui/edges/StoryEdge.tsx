import { BaseEdge, getSmoothStepPath, useInternalNode, type EdgeProps, type InternalNode } from '@xyflow/react';
import { getChoiceSide, getNodeSides, getSideAnchor, type Rect } from '../../lib/edge-routing';

function getNodeRect(node: InternalNode): Rect | undefined {
	const { width, height } = node.measured;

	if (width === undefined || height === undefined) {
		return undefined;
	}

	return { ...node.internals.positionAbsolute, width, height };
}

export function StoryEdge({ source, target, sourceHandleId, markerEnd, style }: EdgeProps) {
	const sourceNode = useInternalNode(source);
	const targetNode = useInternalNode(target);
	const sourceRect = sourceNode && getNodeRect(sourceNode);
	const targetRect = targetNode && getNodeRect(targetNode);

	if (!sourceNode || !sourceRect || !targetRect) {
		return null;
	}

	const { sourceSide, targetSide } = getNodeSides(sourceRect, targetRect);
	const targetPoint = getSideAnchor(targetRect, targetSide);
	const choiceHandle = sourceHandleId
		? sourceNode.internals.handleBounds?.source?.find((handle) => handle.id === sourceHandleId)
		: undefined;

	let sourcePoint = getSideAnchor(sourceRect, sourceSide);
	let sourcePosition = sourceSide;

	if (choiceHandle) {
		sourcePosition = getChoiceSide(sourceRect, targetRect);
		sourcePoint = {
			x: getSideAnchor(sourceRect, sourcePosition).x,
			y: sourceRect.y + choiceHandle.y + choiceHandle.height / 2,
		};
	}

	const [path] = getSmoothStepPath({
		sourceX: sourcePoint.x,
		sourceY: sourcePoint.y,
		sourcePosition,
		targetX: targetPoint.x,
		targetY: targetPoint.y,
		targetPosition: targetSide,
	});

	return (
		<BaseEdge
			path={path}
			markerEnd={markerEnd}
			style={style}
		/>
	);
}
