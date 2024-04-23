import "./style.css";

interface Email {
    sender: string,
    recipient: string,
    content: string,
    order: number,
    uuid: string,
}

interface Coordinate {
    x: number,
    y: number,
}

// class Graph {
//     public nodes: GraphNode[];
//     private canvas: SVGElement;
//     private edgeElements: SVGLineElement[];

//     constructor(canvas: SVGElement) {
//         this.nodes = [];
//         this.edgeElements = [];
//         this.canvas = canvas;
//     }

//     public addNode(newNode: NewNode) {
//         const node = newNode as GraphNode;
//         node.position.x += (50 * Math.random()) - 25;
//         node.position.y += (50 * Math.random()) - 25;
//         node.velocity = { dx: 0, dy: 0 };

//         const position = this.convertCoords(node.position);
//         const nodeElem = createElement("circle", {
//             cx: position.x,
//             cy: position.y,
//             r: 20,
//         }) as SVGCircleElement;
//         // const textElem = createElement("text", {
//         //     cx: position.x,
//         //     cy: position.y,
//         //     r: 20,
//         // }) as SVGCircleElement;

//         node.nodeElement = nodeElem;
//         nodeElem.classList.add("graph-node");
//         this.canvas.appendChild(nodeElem);
//         this.nodes.push(node);
//     }

//     public convertCoords(coords: Coordinate) {
//         return {
//             x: (coords.x + this.canvas.clientWidth) / 2,
//             y: (coords.y + this.canvas.clientHeight) / 2,
//         }
//     }

//     private updatePositions() {
//         this.nodes.forEach(nodeA => {
//             this.nodes.forEach(nodeB => {
//                 if (nodeA === nodeB) return;
//                 updateMomentumByRepullsion(nodeA, nodeB);
//             });
//         });

//         this.nodes.forEach(node => {
//             node.position.x += node.velocity.dx;
//             node.position.y += node.velocity.dy;

//             node.velocity = {
//               dx: node.velocity.dx * 0.9,
//               dy: node.velocity.dy * 0.9,
//             };
//         });
//     }

//     private syncVisuals() {
//         this.nodes.forEach(node => {
//             const nodeElem = node.nodeElement;

//             const position = this.convertCoords(node.position);
//             nodeElem.setAttribute("cx", position.x.toString());
//             nodeElem.setAttribute("cy", position.y.toString());
//         });
//     }

//     public doTimestep() {
//         this.updatePositions();
//         this.syncVisuals();

//         window.requestAnimationFrame(() => this.doTimestep());
//         // setTimeout(() => this.doTimestep(), 1);
//     }
// }

window.addEventListener("load", init);

// GLOBAL VARIABLES
let emails: Email[] = [];
// let graph: Graph;

function init() {
    const addEntryBtn = document.getElementById("add-entry-btn")!;
    addEntryBtn.addEventListener("click", addNewEntry);

    // const canvas = document.getElementById("graph-canvas")! as unknown as HTMLCanvasElement;
    // const resizeCanvas = () => {
    //     canvas.setAttribute("width", (window.innerWidth / 2).toString());
    //     canvas.setAttribute("height", window.innerHeight.toString());
    // };

    // TODO: debounce this!
    // addEventListener("resize", resizeCanvas);
    // resizeCanvas();

    // graph = new Graph(canvas);
    // graph.doTimestep();
}

// TODO: Load this from a JSON file generated with Python which contains sample email templates.
const randomContents = [
    "Hello World",
    "Hi Mom",
    "Foo Bar Baz",
]

function addNewEntry() {
    const entry: Email = {
        sender: `foo_${emails.length + 1}@bar.com`,
        recipient: emails.length > 0 ? emails[emails.length - 1].sender : `foo_0@bar.com`,
        order: emails.length,
        content: pickRandomListItem(randomContents),
        uuid: generateUniqueID(),
    };

    emails.push(entry);
    const element = createEntryElement(entry.uuid);
    const body = document.querySelector("tbody")!;
    body.appendChild(element);
}

function createEntryElement(uuid: string): Node {
    const template = document.getElementById("actions-template")! as HTMLTemplateElement;
    const entry = template.content.cloneNode(true) as HTMLElement;
    const target = emails.find(email => email.uuid === uuid);
    if (!target) {
        throw new Error(`Email with uuid ${uuid} does not exist!`);
    }

    const senderCell = entry.querySelector(".cell-sender") as HTMLElement;
    const recipientCell = entry.querySelector(".cell-recipient") as HTMLElement;
    const contentsCell = entry.querySelector(".cell-contents") as HTMLElement;
    senderCell.textContent = target.sender;
    recipientCell.textContent = target.recipient;
    contentsCell.textContent = target.content;
    entry.querySelector(".cell-order")!.textContent = target.order.toString();

    const goNextOnEnter = (target: HTMLElement) => (evt: KeyboardEvent) => {
        if (evt.key !== "Enter") return;
        target.focus();
        evt.preventDefault();
    }

    senderCell.addEventListener("keydown", goNextOnEnter(recipientCell));
    recipientCell.addEventListener("keydown", goNextOnEnter(contentsCell));
    contentsCell.addEventListener("keydown", (evt: KeyboardEvent) => { if (evt.key === "Escape") contentsCell.blur(); });

    addClickEvent(entry.querySelector(".edit-entry-btn")!, () => {
        senderCell.contentEditable = "true";
        recipientCell.contentEditable = "true";
        contentsCell.contentEditable = "true";
        senderCell.focus();
    });
    addClickEvent(entry.querySelector(".move-entry-btn")!, () => { });
    addClickEvent(entry.querySelector(".delete-entry-btn")!, () => { });

    return entry;
}

function addClickEvent(elem: HTMLElement, func: () => void) {
    elem.addEventListener("click", func);
    elem.addEventListener("keydown", (evt: KeyboardEvent) => {
        if (evt.key === "Enter") func();
    });
}

function calculateDistance(pointA: Coordinate, pointB: Coordinate) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

function generateUniqueID() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function randomInt(min: number, max: number) { // min inclusive, max exclusive
    return Math.max(min, Math.floor(Math.random() * max));
}

function pickRandomListItem(arr: any[]) {
    return arr[randomInt(0, arr.length)];
}