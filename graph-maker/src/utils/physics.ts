import { GraphNode, Point } from "./types";

export function changeMomentumByRepulsion(nodeA: GraphNode, nodeB: GraphNode, attract: boolean, multiplier: number = 1) {
    const distance = calculateDistance(nodeA.position, nodeB.position);
    if (distance == 0) return; // We just don't bother with this edge case since they will move apart.
    if (distance > 500 && !attract) return;

    const directionX = (nodeB.position.x - nodeA.position.x) / distance ** 2;
    const directionY = (nodeB.position.y - nodeA.position.y) / distance ** 2;

    // TODO: Give nodes weight based on number of connections.
    const massNodeA = 1 + 0.5 * nodeA.outgoing.size;
    const massNodeB = 1 + 0.5 * nodeA.outgoing.size;

    // TODO: No magic numbers!
    let modifier = attract ? -multiplier * distance / 25 : 2;
    if (distance < 100) modifier = 2;

    nodeA.velocity = {
        dx: nodeA.velocity.dx - modifier * directionX / massNodeA,
        dy: nodeA.velocity.dy - modifier * directionY / massNodeA,
    }
    nodeB.velocity = {
        dx: nodeB.velocity.dx + modifier * directionX / massNodeB,
        dy: nodeB.velocity.dy + modifier * directionY / massNodeB,
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