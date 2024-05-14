import { useEffect, useRef, useState } from "react";
import { EmailEntry, GraphEdge, GraphNode, Point } from "../utils/types";
import { changeMomentumByInteraction, changeMomentumByBorder, doMomentumTimestep, updateNodeProperties } from "../utils/physics";
import { getCanvasCoordinates, isDarkMode, isMouseOverCircle } from "../utils/misc";
import { renderGraphEdge, renderGraphNode } from "../utils/drawing";
import { useIsMounted } from "../utils/hooks";

import "./styles/GraphCanvas.css";
import PlayPauseControls from "./PlayPauseControls";

interface Props {
    emails: EmailEntry[],
}

export default function GraphCanvas({ emails }: Props) {
    // const [playing, setPlaying] = useState(false);
    const [scrubberPosition, setScrubberPosition] = useState(0);
    const lastVisibleEdge = useRef(scrubberPosition);
    const maxTimestamp = emails.length;

    useEffect(() => {
        lastVisibleEdge.current = scrubberPosition;
    }, [scrubberPosition]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMounted = useIsMounted();

    const graphNodes = useRef<GraphNode[]>([]);
    const graphEdges = useRef<GraphEdge[]>([]);

    const initNodes = (center: Point) => {
        const allAddresses = emails.reduce(function (result: string[], email) {
            result.push(email.sender);
            result.push(email.recipient);
            return result;
        }, []);
        const uniqueAddresses = [...new Set(allAddresses)];
        
        const newNodes: GraphNode[] = uniqueAddresses.map(address => {
            return {
                address: address,
                contacts: {},
                position: { x: center.x, y: center.y },
                velocity: { dx: 0, dy: 0 },

                mass: 1, // Currently never used/updated!
                
                // To be calculated later:
                infectedAfter: -1,
                hovered: false,
                dragging: false,
                sentCount: new Array(maxTimestamp).fill(0),
                radius: 1,
            };
        });

        newNodes.forEach(node => {
            const spread = newNodes.length * 5;
            node.position.x += spread * (Math.random() - 0.5);
            node.position.y += spread * (Math.random() - 0.5);

            const firstInfectionSent = findIndexOrNone(emails, email => email.infected && email.sender === node.address);
            const firstInfectionRecieved = findIndexOrNone(emails, email => email.infected && email.recipient === node.address);
            node.infectedAfter = firstInfectionRecieved;

            if ((firstInfectionSent !== undefined && !firstInfectionRecieved) || (firstInfectionSent && firstInfectionRecieved && firstInfectionSent < firstInfectionRecieved)) {
                // There will be some nodes which send an infected email before ever recieving one, or which never recieve an infected email.
                // These nodes are the malicious nodes which begin spreading the worm, and should be shown as infected from the beginning.
                node.infectedAfter = -1;
            }

            let sendCount = 0;
            emails.forEach((email, idx) => {
                if (email.sender === node.address) sendCount++;
                node.sentCount[idx + 1] = sendCount;
            });

            const sent = emails.filter(email => email.sender === node.address);
            const contacts = sent
                .map(email => email.recipient)
                .map(recipient => newNodes.findIndex(node => node.address === recipient));

            contacts.forEach(contact => {
                if (contact in node.contacts) node.contacts[contact] += 1;
                else node.contacts[contact] = 1;
            });
        });

        return newNodes;
    };

    const initEdges = (nodes: GraphNode[]) => {
        const newEdges = emails.reduce(function (result: GraphEdge[], email, idx) {
            const senderIndex = nodes.findIndex(node => node.address === email.sender);
            const recipientIndex = nodes.findIndex(node => node.address === email.recipient);

            if (recipientIndex !== -1) {
                result.push({
                    to: recipientIndex,
                    from: senderIndex,
                    order: idx,
                });
            }

            return result;
        }, []);

        return newEdges;
    };

    useEffect(() => {
        // We just rendered, so canvasRef must be attached to the canvas element.
        const context = canvasRef.current!.getContext("2d", { alpha: false })!;
        const dims = canvasRef.current!.getBoundingClientRect();
        canvasRef.current!.width = dims.width;
        canvasRef.current!.height = dims.height;

        const center = { x: dims.width / 2, y: dims.height / 2 };
        graphNodes.current = initNodes(center);
        graphEdges.current = initEdges(graphNodes.current);

        // The timestep function handles the graph's physics.
        const doTimestep = () => {
            for (let i = 0; i < graphNodes.current.length - 1; i++) {
                for (let j = i + 1; j < graphNodes.current.length; j++) {
                    const edgeIndex = findMatchingEdgeIndex(graphEdges.current, i, j);

                    const nodeA = graphNodes.current[i];
                    const nodeB = graphNodes.current[j];

                    const areContacts = edgeIndex < lastVisibleEdge.current && edgeIndex !== -1;
                    const contactWeight = Math.max(nodeA.contacts[j] || 1, nodeB.contacts[i] || 1);

                    changeMomentumByInteraction(nodeA, nodeB, areContacts, contactWeight);
                }
            }

            graphNodes.current.forEach(node => {
                if (node.dragging) return;
                changeMomentumByBorder(node, dims);
                doMomentumTimestep(node);
            });
        };

        const drawFrame = () => {
            const darkMode = isDarkMode();
            if (darkMode) context.fillStyle = "rgba(26,26,26,0.75)";
            else context.fillStyle = "rgba(243,243,243,0.75)";
            context.fillRect(0, 0, dims.width, dims.height); // Clear prev frame

            doTimestep();
            graphEdges.current.forEach((edge, idx) => {
                if (idx >= lastVisibleEdge.current) return;

                const nodeA = graphNodes.current[edge.from];
                const nodeB = graphNodes.current[edge.to];

                renderGraphEdge(context, nodeA, nodeB, darkMode);
            });
            graphNodes.current.forEach(node => {
                updateNodeProperties(node, lastVisibleEdge.current);

                const isInfected = node.infectedAfter !== undefined && node.infectedAfter < lastVisibleEdge.current;
                renderGraphNode(context, node, isInfected, darkMode);
            });

            if (isMounted.current) window.requestAnimationFrame(drawFrame);
        };

        let hasDraggingTarget = false;
        const handleMouseInteract = (evt: MouseEvent) => {
            const mousePos = { x: evt.clientX, y: evt.clientY };

            for (let i = 0; i < graphNodes.current.length; i++) {
                if (!hasDraggingTarget) {
                    graphNodes.current[i].hovered = isMouseOverCircle(canvasRef.current!, mousePos, graphNodes.current[i].position, graphNodes.current[i].radius);
                }

                if (graphNodes.current[i].hovered && evt.buttons === 1) {
                    graphNodes.current[i].dragging = true;
                    hasDraggingTarget = true;
                }

                if (graphNodes.current[i].dragging && !evt.buttons) {
                    graphNodes.current[i].dragging = false;
                    graphNodes.current[i].velocity = { dx: 0, dy: 0 };
                    hasDraggingTarget = false;
                }

                if (graphNodes.current[i].dragging) {
                    const adjustedPos = getCanvasCoordinates(canvasRef.current!, mousePos);
                    graphNodes.current[i].position = adjustedPos;
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

    return (
        <>
            <canvas ref={canvasRef} id="graph-canvas"></canvas>
            <PlayPauseControls
                // playing={playing}
                // setPlaying={setPlaying}
                scrubberPosition={scrubberPosition}
                setScrubberPosition={setScrubberPosition}
                maxTimestamp={maxTimestamp}
            />
        </>
    );
}

function findIndexOrNone<T>(arr: T[], predicate: (value: T, index: number, obj: T[]) => void) {
    const index = arr.findIndex(predicate);
    return index === -1 ? undefined : index;
}

function findMatchingEdgeIndex(edges: GraphEdge[], indexA: number, indexB: number) {
    const edgeIndex = edges.findIndex(edge =>
        (edge.to === indexA && edge.from === indexB) ||
        (edge.to === indexB && edge.from === indexA)
    );
    return edgeIndex;
}