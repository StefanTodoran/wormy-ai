import { DrawStyle, GraphNode, Point } from "./types";

export function drawCircle(context: CanvasRenderingContext2D, center: Point, radius: number, style: DrawStyle) {
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);

    if (style.fillColor) {
        context.fillStyle = style.fillColor;
        context.fill();
    }

    if (style.strokeWidth && style.strokeColor) {
        context.lineWidth = style.strokeWidth;
        context.strokeStyle = style.strokeColor;
        context.stroke();
    }
}

function setFontSize(context: CanvasRenderingContext2D, size: number) {
    const match = /(?<value>\d+\.?\d*)/;
    context.font = context.font.replace(match, size.toString());
}

export function drawText(context: CanvasRenderingContext2D, position: Point, text: string, style: DrawStyle) {
    setFontSize(context, style.fontSize || 12);

    const x = style.centered ? position.x - (context.measureText(text).width / 2) : position.x;
    const y = position.y;

    if (style.strokeColor) {
        context.miterLimit = 2;
        context.lineWidth = style.strokeWidth || 2;
        context.strokeStyle = style.strokeColor;
        context.strokeText(text, x, y);
    }

    context.fillStyle = style.fillColor || "#fff";
    context.fillText(text, x, y);
}

function drawLine(context: CanvasRenderingContext2D, positionA: Point, positionB: Point, style: DrawStyle) {
    context.lineWidth = style.strokeWidth || 1;
    context.strokeStyle = style.strokeColor || "#fff";

    context.beginPath();
    context.moveTo(positionA.x, positionA.y);
    context.lineTo(positionB.x, positionB.y);
    context.stroke();
}

/**
 * Draws a line between positionA and positionB. Arrowhead will be on positionB.
 */
function drawArrow(context: CanvasRenderingContext2D, positionA: Point, positionB: Point, style: DrawStyle, headLength: number = 10) {
    context.lineWidth = style.strokeWidth || 1;
    context.strokeStyle = style.strokeColor || "#fff";

    const dx = positionB.x - positionA.x;
    const dy = positionB.y - positionA.y;
    const angle = Math.atan2(dy, dx);

    context.beginPath();
    context.moveTo(positionA.x, positionA.y);
    context.lineTo(positionB.x, positionB.y);
    context.lineTo(positionB.x - headLength * Math.cos(angle - Math.PI / 6), positionB.y - headLength * Math.sin(angle - Math.PI / 6));
    context.moveTo(positionB.x, positionB.y);
    context.lineTo(positionB.x - headLength * Math.cos(angle + Math.PI / 6), positionB.y - headLength * Math.sin(angle + Math.PI / 6));
    context.stroke();
}

export function drawArrowToCircle(context: CanvasRenderingContext2D, nodeA: GraphNode, nodeB: GraphNode, style: DrawStyle) {
    const dx = nodeA.position.x - nodeB.position.x;
    const dy = nodeA.position.y - nodeB.position.y;
    
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const ratio = nodeB.radius / distance;

    const nodeBEdge: Point = {
        x: nodeB.position.x + ratio * dx,
        y: nodeB.position.y + ratio * dy,
    };

    drawArrow(context, nodeA.position, nodeBEdge, style);
}