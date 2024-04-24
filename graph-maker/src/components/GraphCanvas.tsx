import { useEffect, useRef } from "react";
import { EmailEntry, GraphNode, Point } from "../utils/types";
import { changeMomentumByRepulsion, doMomentumTimestep } from "../utils/physics";
import { drawCircle, drawLine, drawText } from "../utils/drawing";

import "./styles/GraphCanvas.css";

interface Props {
    emails: EmailEntry[],
}

export default function GraphCanvas({ emails }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const initNodes = (center: Point) => {
        const allSenders = emails.map(email => email.sender);
        const uniqueSenders = [...new Set(allSenders)];

        const newNodes: GraphNode[] = [];
        uniqueSenders.forEach((sender, idx) => {
            newNodes.push({
                id: idx,
                position: { x: center.x + 5 * (Math.random() - 0.5), y: center.y + 5 * (Math.random() - 0.5) },
                velocity: { dx: 0, dy: 0 },
                label: sender,
                outgoing: new Set(),
                weights: {},
            });
        });

        newNodes.forEach(node => {
            const contacts = emails
                .filter(email => email.sender === node.label)
                .map(email => email.recipient)
                .map(recipient => newNodes.findIndex(node => node.label === recipient));

            node.outgoing = new Set(contacts);
            contacts.forEach(contact => {
                if (contact in node.weights) node.weights[contact] += 1;
                else node.weights[contact] = 1;
            });
        });

        return newNodes;
    };

    useEffect(() => {
        // We just rendered, so canvasRef must be attached to the canvas element.
        const context = canvasRef.current!.getContext("2d", { alpha: false })!;
        const dims = canvasRef.current!.getBoundingClientRect();
        canvasRef.current!.width = dims.width;
        canvasRef.current!.height = dims.height;

        const center = { x: dims.width / 2, y: dims.height / 2 };
        const nodes: GraphNode[] = initNodes(center);

        const doTimestep = () => {
            nodes.forEach(nodeA => {
                for (let i = 0; i < nodes.length; i++) {
                    const nodeB = nodes[i];
                    if (nodeA === nodeB) return;

                    changeMomentumByRepulsion(nodeA, nodeB, nodeA.outgoing.has(i), nodeA.weights[i]);
                }
            });

            nodes.forEach(node => {
                doMomentumTimestep(node);
            });
        };

        const drawFrame = () => {
            context.fillStyle = "rgba(0,0,0,0.5)";
            context.fillRect(0, 0, dims.width, dims.height);
            // context.clearRect(0, 0, dims.width, dims.height);

            doTimestep();

            nodes.forEach(node => {
                for (let i = 0; i < nodes.length; i++) {
                    if (node.outgoing.has(i)) {
                        drawLine(context, node.position, nodes[i].position, {
                            strokeColor: "#999",
                            strokeWidth: node.weights[i],
                        });
                    }
                }
            });

            nodes.forEach(node => {
                drawCircle(context, node.position, 20, {
                    fillColor: "#666",
                    strokeColor: "#333",
                    strokeWidth: 3,
                });

                drawText(context, node.position, node.label, {
                    strokeColor: "#646cff",
                    centered: true,
                });
            });

            window.requestAnimationFrame(drawFrame);
        };

        window.requestAnimationFrame(drawFrame);
    }, []);

    return (<canvas ref={canvasRef} id="graph-canvas"></canvas>);
}