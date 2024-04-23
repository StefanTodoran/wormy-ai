import "./style.css";

interface Email {
    sender: string,
    recipient: string,
    content: string,
    order: number,
}

interface NewNode {
    id: string,
    position: Coordinate,
}

interface GraphNode {
    id: string,
    outgoing: string[],
    position: Coordinate,
    velocity: { dx: number, dy: number },
    nodeElement: SVGCircleElement,
    labelElement: SVGTextElement,
}

interface Coordinate {
    x: number,
    y: number,
}

class Graph {
    public nodes: GraphNode[];
    private canvas: SVGElement;
    private edgeElements: SVGLineElement[];

    constructor(canvas: SVGElement) {
        this.nodes = [];
        this.edgeElements = [];
        this.canvas = canvas;
    }

    public addNode(newNode: NewNode) {
        const node = newNode as GraphNode;
        node.position.x += (50 * Math.random()) - 25;
        node.position.y += (50 * Math.random()) - 25;
        node.velocity = { dx: 0, dy: 0 };

        const position = this.convertCoords(node.position);
        const nodeElem = createElement("circle", {
            cx: position.x,
            cy: position.y,
            r: 20,
        }) as SVGCircleElement;
        // const textElem = createElement("text", {
        //     cx: position.x,
        //     cy: position.y,
        //     r: 20,
        // }) as SVGCircleElement;

        node.nodeElement = nodeElem;
        nodeElem.classList.add("graph-node");
        this.canvas.appendChild(nodeElem);
        this.nodes.push(node);
    }

    public convertCoords(coords: Coordinate) {
        return {
            x: (coords.x + this.canvas.clientWidth) / 2,
            y: (coords.y + this.canvas.clientHeight) / 2,
        }
    }

    private updatePositions() {
        this.nodes.forEach(nodeA => {
            this.nodes.forEach(nodeB => {
                if (nodeA === nodeB) return;
                updateMomentumByRepullsion(nodeA, nodeB);
            });
        });

        this.nodes.forEach(node => {
            node.position.x += node.velocity.dx;
            node.position.y += node.velocity.dy;
            
            node.velocity = {
              dx: node.velocity.dx * 0.9,
              dy: node.velocity.dy * 0.9,
            };
        });
    }

    private syncVisuals() {
        this.nodes.forEach(node => {
            const nodeElem = node.nodeElement;

            const position = this.convertCoords(node.position);
            nodeElem.setAttribute("cx", position.x.toString());
            nodeElem.setAttribute("cy", position.y.toString());
        });
    }

    public doTimestep() {
        this.updatePositions();
        this.syncVisuals();

        window.requestAnimationFrame(() => this.doTimestep());
        // setTimeout(() => this.doTimestep(), 1);
    }
}

window.addEventListener("load", init);

// GLOBAL VARIABLES
let emails: Email[] = [];
let graph: Graph;

function init() {
    const createNodeBtn = document.getElementById("create-node-btn")!;
    createNodeBtn.addEventListener("click", createNewNode);

    const canvas = document.getElementById("canvas")! as unknown as SVGElement;
    const resizeCanvas = () => {
        canvas.setAttribute("width", window.innerWidth.toString());
        canvas.setAttribute("height", window.innerHeight.toString());
    };

    // TODO: debounce this!
    addEventListener("resize", resizeCanvas);
    resizeCanvas();

    graph = new Graph(canvas);
    graph.doTimestep();
}

function createNewNode() {
    const address = `foo${emails.length}@bar.com`;
    graph.addNode({
        id: address,
        position: {
            x: 0,
            y: 0,
        },
    });
}

interface ElementProps {
    [key: string]: number | string | boolean,
}

function createElement(type: string, props: ElementProps) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", type);
    for (const prop in props) {
        const hypenated = prop.replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`);
        // @ts-expect-error Ignored because props[prop] gets converted to a string anyway.
        element.setAttributeNS(null, hypenated, props[prop]);
    }
    return element;
}

function calculateDistance(pointA: Coordinate, pointB: Coordinate) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

function updateMomentumByRepullsion(nodeA: GraphNode, nodeB: GraphNode) {
    const distance = calculateDistance(nodeA.position, nodeB.position);
    // const minDistance = 1000;

    // if (distance < minDistance) {
    if (distance == 0) return; // TODO: handle this edge case!

    const directionX = (nodeB.position.x - nodeA.position.x) / distance ** 2;
    const directionY = (nodeB.position.y - nodeA.position.y) / distance ** 2;

    nodeA.velocity = {
        dx: nodeA.velocity.dx - directionX,
        dy: nodeA.velocity.dy - directionY,
    };
    nodeB.velocity = {
        dx: nodeB.velocity.dx + directionX,
        dy: nodeB.velocity.dy + directionY,
    };
    // }
}