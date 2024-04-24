import { EmailEntry } from "../utils/types";
import "./styles/GraphCanvas.css";

interface Props {
    emails: EmailEntry[],
}

export default function GraphCanvas({ emails }: Props) {
    const names = emails.map(email => email.name);

    return (<canvas id="graph-canvas"></canvas>);
}