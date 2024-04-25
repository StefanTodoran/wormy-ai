import { useEffect, useRef } from "react";
import { EmailEntry, GraphNode, Point } from "../utils/types";
import { changeMomentumByAttraction, changeMomentumByEdges, changeMomentumByRepulsion, doMomentumTimestep } from "../utils/physics";
import { drawCircle, drawLine, drawText } from "../utils/drawing";
import { useIsMounted } from "../utils/hooks";

import "./styles/GraphCanvas.css";

interface Props {
    emails: EmailEntry[],
}

export default function GraphCanvas({ emails }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMounted = useIsMounted();

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

                // To be calculated later:
                outgoing: new Set(),
                weights: {},
                infected: false,
                radius: 0,
            });
        });

        newNodes.forEach(node => {
            const sent = emails.filter(email => email.sender === node.label);
            const infected = sent.findIndex(email => email.infected) !== -1;
            node.infected = infected;

            const contacts = sent
                .map(email => email.recipient)
                .map(recipient => newNodes.findIndex(node => node.label === recipient));

            node.outgoing = new Set(contacts);
            contacts.forEach(contact => {
                if (contact in node.weights) node.weights[contact] += 1;
                else node.weights[contact] = 1;

                node.radius = 14 + 2 * node.outgoing.size;
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

                    if (nodeA.outgoing.has(i)) changeMomentumByAttraction(nodeA, nodeB, nodeA.weights[i]);
                    else changeMomentumByRepulsion(nodeA, nodeB);
                }
            });

            nodes.forEach(node => {
                changeMomentumByEdges(node, dims);
                doMomentumTimestep(node);
            });
        };

        const drawFrame = () => {
            context.fillStyle = "rgba(26,26,26,0.5)";
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
                drawCircle(context, node.position, node.radius, {
                    fillColor: node.infected ? "#685252" : "#666",
                    strokeColor: node.infected ? "#352929" : "#333",
                    strokeWidth: 3,
                });

                // TODO: Remove this, was for debugging.
                // drawCircle(context, node.position, node.radius * 5, { strokeColor: "#99999911", strokeWidth: 1 });
                // drawCircle(context, node.position, node.radius * 20, { strokeColor: "#99999911", strokeWidth: 1 });

                drawText(context, node.position, node.label, {
                    strokeColor: node.infected ? "#ff7664" : "#646cff",
                    centered: true,
                });
            });

            if (isMounted.current) window.requestAnimationFrame(drawFrame);
        };

        window.requestAnimationFrame(drawFrame);
    }, []);

    return (<canvas ref={canvasRef} id="graph-canvas"></canvas>);
}