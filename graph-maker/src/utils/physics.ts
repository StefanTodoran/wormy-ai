import { GraphNode, Point } from "./types";

export function changeMomentumByRepulsion(nodeA: GraphNode, nodeB: GraphNode) {
    let distance = calculateDistance(nodeA.position, nodeB.position);
    if (distance > nodeA.radius * 20) return; // Ignore very far away nodes.
    if (distance == 0) distance = 0.01;

    const directionX = (nodeB.position.x - nodeA.position.x) / distance ** 2;
    const directionY = (nodeB.position.y - nodeA.position.y) / distance ** 2;

    // TODO: Factor this out.
    const massNodeA = 1 + 0.5 * nodeA.outgoing.size;
    const massNodeB = 1 + 0.5 * nodeA.outgoing.size;

    const repulsionMultiplier = 2;
    nodeA.velocity = {
        dx: nodeA.velocity.dx - repulsionMultiplier * directionX / massNodeA,
        dy: nodeA.velocity.dy - repulsionMultiplier * directionY / massNodeA,
    }
    nodeB.velocity = {
        dx: nodeB.velocity.dx + repulsionMultiplier * directionX / massNodeB,
        dy: nodeB.velocity.dy + repulsionMultiplier * directionY / massNodeB,
    }
}

export function changeMomentumByAttraction(nodeA: GraphNode, nodeB: GraphNode, multiplier: number = 1) {
    const distance = calculateDistance(nodeA.position, nodeB.position);
    if (distance < nodeA.radius * 5) return; // Don't be attracted to super close nodes.

    const directionX = (nodeB.position.x - nodeA.position.x) / distance ** 2;
    const directionY = (nodeB.position.y - nodeA.position.y) / distance ** 2;

    // TODO: Factor this out.
    const massNodeA = 1 + 0.5 * nodeA.outgoing.size;
    const massNodeB = 1 + 0.5 * nodeA.outgoing.size;

    const attractionForce = multiplier * distance / 10;
    nodeA.velocity = {
        dx: nodeA.velocity.dx + attractionForce * directionX / massNodeA,
        dy: nodeA.velocity.dy + attractionForce * directionY / massNodeA,
    }
    nodeB.velocity = {
        dx: nodeB.velocity.dx - attractionForce * directionX / massNodeB,
        dy: nodeB.velocity.dy - attractionForce * directionY / massNodeB,
    }
}

export function doMomentumTimestep(node: GraphNode) {
    advanceByMomentum(node);
    doMomentumDecay(node);
}

export function changeMomentumByEdges(node: GraphNode, dims: DOMRect) {
    const wallOffset = 20;

    if (node.position.x < node.radius + wallOffset) node.velocity.dx *= -1;
    if (node.position.x > dims.width - (node.radius + wallOffset)) node.velocity.dx *= -1;

    if (node.position.y < node.radius + wallOffset) node.velocity.dy *= -1;
    if (node.position.y > dims.height - (node.radius + wallOffset)) node.velocity.dy *= -1;
}

function advanceByMomentum(target: GraphNode) {
    target.position.x += target.velocity.dx;
    target.position.y += target.velocity.dy;
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