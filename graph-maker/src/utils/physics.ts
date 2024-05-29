import { GraphNode, Point } from "./types";

// @ts-expect-error
export function changeMomentumByInteraction(nodeA: GraphNode, nodeB: GraphNode, attract: boolean, attractionWeight: number = 1) {
    let distance = calculateDistance(nodeA.position, nodeB.position);
    const bumpDistance = nodeA.radius + nodeB.radius;
    
    const minDistance = bumpDistance;
    if (attract && distance > minDistance) {
        changeMomentumByAttraction(nodeA, nodeB); // attractionWeight
    }
    
    if (distance < bumpDistance * 10) {
        changeMomentumByRepulsion(nodeA, nodeB);
    }
}

function changeMomentumByRepulsion(nodeA: GraphNode, nodeB: GraphNode) {
    let distance = calculateDistance(nodeA.position, nodeB.position);
    if (distance == 0) distance = 0.01;
    
    const directionX = (nodeB.position.x - nodeA.position.x) / distance ** 2;
    const directionY = (nodeB.position.y - nodeA.position.y) / distance ** 2;
    
    let repulsionMultiplier = 2;
    const bumpDistance = nodeA.radius + nodeB.radius;
    if (distance < bumpDistance * 5) repulsionMultiplier = 25;
    if (distance < bumpDistance) repulsionMultiplier = 50;

    nodeA.velocity = {
        dx: nodeA.velocity.dx - repulsionMultiplier * directionX / nodeA.mass,
        dy: nodeA.velocity.dy - repulsionMultiplier * directionY / nodeA.mass,
    }
    nodeB.velocity = {
        dx: nodeB.velocity.dx + repulsionMultiplier * directionX / nodeB.mass,
        dy: nodeB.velocity.dy + repulsionMultiplier * directionY / nodeB.mass,
    }
}

function changeMomentumByAttraction(nodeA: GraphNode, nodeB: GraphNode, multiplier: number = 1) {
    const distance = calculateDistance(nodeA.position, nodeB.position);

    const directionX = (nodeB.position.x - nodeA.position.x) / distance ** 2;
    const directionY = (nodeB.position.y - nodeA.position.y) / distance ** 2;
    const attractionForce = Math.sqrt(multiplier) * (distance ** 2) / 1000;

    nodeA.velocity = {
        dx: nodeA.velocity.dx + attractionForce * directionX / nodeA.mass,
        dy: nodeA.velocity.dy + attractionForce * directionY / nodeA.mass,
    }
    nodeB.velocity = {
        dx: nodeB.velocity.dx - attractionForce * directionX / nodeB.mass,
        dy: nodeB.velocity.dy - attractionForce * directionY / nodeB.mass,
    }
}

export function doMomentumTimestep(node: GraphNode) {
    advanceByMomentum(node);
    doMomentumDecay(node);
}

function handleSingleBorderRepulsion(node: GraphNode, border: Point) {
    const distance = calculateDistance(border, node.position) || 0.01;
    const directionX = (node.position.x - border.x) / distance ** 2;
    const directionY = (node.position.y - border.y) / distance ** 2;
    const repulsionMultiplier = 10;

    node.velocity = {
        dx: node.velocity.dx + repulsionMultiplier * directionX / node.mass,
        dy: node.velocity.dy + repulsionMultiplier * directionY / node.mass,
    }
}

export function changeMomentumByBorder(node: GraphNode, dims: DOMRect) {
    // if (node.position.x < node.radius) node.position.x = node.radius;
    // if (node.position.y < node.radius) node.position.y = node.radius;
    // if (node.position.x > dims.width - node.radius) node.position.x = dims.width - node.radius;
    // if (node.position.y > dims.height - node.radius) node.position.y = dims.height - node.radius;

    node.position.x = Math.max(node.radius, node.position.x);
    node.position.y = Math.max(node.radius, node.position.y);
    node.position.x = Math.min(dims.width - node.radius, node.position.x);
    node.position.y = Math.min(dims.height - node.radius, node.position.y);

    const borderPositions = [
        { x: node.position.x, y: 0 },
        { x: 0, y: node.position.y },
        { x: dims.width, y: node.position.y },
        { x: node.position.x, y: dims.height },
    ];

    borderPositions.forEach(border => handleSingleBorderRepulsion(node, border));
}

function advanceByMomentum(target: GraphNode) {
    const totalSpeed = Math.abs(target.velocity.dx) + Math.abs(target.velocity.dy);
    const frictionCoefficient = totalSpeed < 2 ? totalSpeed / 2 : 1;
    
    target.position.x += frictionCoefficient * target.velocity.dx;
    target.position.y += frictionCoefficient * target.velocity.dy;
}

function doMomentumDecay(target: GraphNode) {
    target.velocity = {
        dx: target.velocity.dx * 0.95, // TODO: This could also be based on number of connections.
        dy: target.velocity.dy * 0.95,
    }
}

function calculateDistance(pointA: Point, pointB: Point) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

export function updateNodeProperties(node: GraphNode, edgeIndex: number) {
    node.radius = calculateNodeRadius(node, edgeIndex);
    node.mass = 1 + (0.1 * node.sentCount[edgeIndex]);
}

function calculateNodeRadius(node: GraphNode, edgeIndex: number) {
    const baseRadius = 15;
    switch (node.sentCount[edgeIndex]) {
        case 0:
            return baseRadius;
        case 1:
            return baseRadius + 3;
        case 2:
            return baseRadius + 3 + 2;
        default:
            // baseRadius + 3 + 2 + (1 * extra sends)
            return baseRadius + 3 + node.sentCount[edgeIndex];
    }
}