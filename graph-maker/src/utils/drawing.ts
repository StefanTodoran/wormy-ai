import { DrawStyle, GraphNode, Point } from "./types";

function drawCircle(context: CanvasRenderingContext2D, center: Point, radius: number, style: DrawStyle) {
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

function drawText(context: CanvasRenderingContext2D, position: Point, text: string, style: DrawStyle) {
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

// @ts-ignore Unused function, but we may need it in the future.
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

export function drawArrowToCircle(context: CanvasRenderingContext2D, positionA: Point, positionB: Point, radius: number, style: DrawStyle) {
    const dx = positionA.x - positionB.x;
    const dy = positionA.y - positionB.y;
    
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const ratio = radius / distance;

    const circleEdge: Point = {
        x: positionB.x + ratio * dx,
        y: positionB.y + ratio * dy,
    };

    drawArrow(context, positionA, circleEdge, style);
}

const nodeStrokeWidth = 3;

export function renderGraphEdge(context: CanvasRenderingContext2D, nodeA: GraphNode, nodeB: GraphNode, darkMode: boolean) {
    const doHighlight = nodeA.hovered || nodeA.dragging;
    const highlightedStroke = darkMode ? "#ddd" : "#555";
    
    const strokeColor = doHighlight ? highlightedStroke : "#999";
    const edgeWeight = doHighlight ? 2 : 1;

    drawArrowToCircle(context, nodeA.position, nodeB.position, nodeB.radius + nodeStrokeWidth, {
        strokeColor: strokeColor,
        strokeWidth: edgeWeight,
    });
}

export function renderGraphNode(context: CanvasRenderingContext2D, node: GraphNode, darkMode: boolean) {
    drawCircle(context, node.position, node.radius, {
        fillColor: node.infected ? "#685252" : "#666",
        strokeColor: node.infected ? "#352929" : "#333",
        strokeWidth: 3,
    });

    if (node.hovered || node.dragging) {
        drawCircle(context, node.position, node.radius * 2, {
            strokeColor: "#99999933", strokeWidth: 1,
        });
    }

    const textStrokeColor = darkMode ? (node.infected ? "#ff7664" : "#646cff") : "#fff";
    const textFillColor = darkMode ? "#fff" : (node.infected ? "#ff7664" : "#646cff");

    const labelPosition = { x: node.position.x, y: node.position.y - node.radius * 0.1 };
    drawText(context, labelPosition, node.address, {
        strokeColor: textStrokeColor,
        fillColor: textFillColor,
        fontSize: node.hovered ? 12 : 11,
        strokeWidth: nodeStrokeWidth,
        centered: true,
    });
    
    // const countPosition = { x: node.position.x, y: node.position.y + node.radius * 0.5 };
    // drawText(context, countPosition, node.idx, {
    //     strokeColor: textStrokeColor,
    //     fillColor: textFillColor,
    //     fontSize: node.hovered ? 11 : 10,
    //     strokeWidth: 3,
    //     centered: true,
    // });

    // const countPosition = { x: node.position.x, y: node.position.y + node.radius * 0.5 };
    // drawText(context, countPosition, node.outgoing.size.toString(), {
    //     strokeColor: textStrokeColor,
    //     fillColor: textFillColor,
    //     fontSize: node.hovered ? 11 : 10,
    //     strokeWidth: 3,
    //     centered: true,
    // });
}