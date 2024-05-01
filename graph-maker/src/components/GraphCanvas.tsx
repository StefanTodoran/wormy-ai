import { useEffect, useRef } from "react";
import { EmailEntry, GraphNode, Point } from "../utils/types";
import { changeMomentumByInteraction, changeMomentumByEdges, doMomentumTimestep } from "../utils/physics";
import { drawCircle, drawLine, drawText } from "../utils/drawing";
import { getCanvasCoordinates, isMouseOverCircle } from "../utils/misc";
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
                position: { x: center.x + 50 * (Math.random() - 0.5), y: center.y + 50 * (Math.random() - 0.5) },
                velocity: { dx: 0, dy: 0 },
                label: sender,

                // To be calculated later:
                outgoing: new Set(),
                weights: {},
                infected: false,
                hovered: false,
                dragging: false,
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

                node.radius = 15 + 3 * node.outgoing.size;
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
            for (let i = 0; i < nodes.length - 1; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];

                    const areContacts = nodeA.outgoing.has(j) || nodeB.outgoing.has(i);
                    const contactWeight = Math.max(nodeA.weights[j] || 1, nodeB.weights[i] || 1);

                    changeMomentumByInteraction(nodeA, nodeB, areContacts, contactWeight);
                }
            }

            nodes.forEach(node => {
                if (node.dragging) return;
                changeMomentumByEdges(node, dims);
                doMomentumTimestep(node);
            });
        };

        const drawFrame = () => {
            const isDarkMode = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
            
            if (isDarkMode) context.fillStyle = "rgba(26,26,26,0.5)";
            else context.fillStyle = "rgba(243,243,243,0.5)";
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

                if (node.hovered || node.dragging) {
                    drawCircle(context, node.position, node.radius * 2, {
                        strokeColor: "#99999933", strokeWidth: 1,
                    });
                }

                // const textPosition = { x: node.position.x, y: node.position.y - node.radius };
                drawText(context, node.position, node.label, {
                    strokeColor: isDarkMode ? (node.infected ? "#ff7664" : "#646cff") : "#fff",
                    fillColor: isDarkMode ? "#fff" : (node.infected ? "#ff7664" : "#646cff"),
                    fontSize: node.hovered ? 12 : 11,
                    strokeWidth: 3,
                    centered: true,
                });
            });

            if (isMounted.current) window.requestAnimationFrame(drawFrame);
        };

        let hasDraggingTarget = false;
        const handleMouseInteract = (evt: MouseEvent) => {
            const mousePos = { x: evt.clientX, y: evt.clientY };

            for (let i = 0; i < nodes.length; i++) {
                if (!hasDraggingTarget) {
                    nodes[i].hovered = isMouseOverCircle(canvasRef.current!, mousePos, nodes[i].position, nodes[i].radius);
                }

                if (nodes[i].hovered && evt.buttons) {
                    nodes[i].dragging = true;
                    hasDraggingTarget = true;
                }
                
                if (nodes[i].dragging && !evt.buttons) {
                    nodes[i].dragging = false;
                    hasDraggingTarget = false;
                }

                if (nodes[i].dragging) {
                    const adjustedPos = getCanvasCoordinates(canvasRef.current!, mousePos);
                    nodes[i].position = adjustedPos;
                }
            }
        };

        window.requestAnimationFrame(drawFrame);
        canvasRef.current?.addEventListener("mousemove", handleMouseInteract);
        canvasRef.current?.addEventListener("mousedown", handleMouseInteract);
        canvasRef.current?.addEventListener("mouseup", handleMouseInteract);

        return () => {
            canvasRef.current?.removeEventListener("mousemove", handleMouseInteract);
            canvasRef.current?.removeEventListener("mousedown", handleMouseInteract);
            canvasRef.current?.removeEventListener("mouseup", handleMouseInteract);
        };
    }, []);

    return (<canvas ref={canvasRef} id="graph-canvas"></canvas>);
}