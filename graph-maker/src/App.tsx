import { useState } from "react";
import EmailRow from "./components/EmailRow";
import IconButton from "./components/IconButton";
import { downloadJSON, getFilledOutTemplate, pickRandomListItem, randomEmailAddress } from "./utils/misc";
import { EmailEntry, Templates } from "./utils/types";

import AddIcon from "./assets/add-icon.svg";
import GraphIcon from "./assets/graph-icon.svg";
import TableIcon from "./assets/table-icon.svg";
import UploadIcon from "./assets/upload-icon.svg";
import DownloadIcon from "./assets/download-icon.svg";
import "./App.css";

enum AppView {
    TABLE,
    GRAPH,
}

function App() {
    const [view, setView] = useState(AppView.TABLE);
    const [templates, setTemplates] = useState<Templates>();

    fetch("./templates.json")
        .then(res => res.json())
        .then(json => setTemplates(json));

    const [emails, setEmails] = useState<EmailEntry[]>([]);
    const [editing, setEditing] = useState(-1);
    const [dragging, setDragging] = useState(-1);

    const changeEditing = (target: number) => {
        if (editing === target) {
            setEditing(-1);
            return;
        }
        setEditing(target);
        setDragging(-1);
    };

    const changeDragging = (target: number) => {
        if (dragging === target) {
            setDragging(-1);
            return;
        }
        setDragging(target);
        setEditing(-1);
    };

    const addNewEmail = () => {
        const name = pickRandomListItem(templates!.names);

        // const existing
        const sender = randomEmailAddress(name, templates!.domains);

        let recipient, recipientName;
        if (emails.length == 0) {
            recipientName = pickRandomListItem(templates!.names, [name]);
            recipient = randomEmailAddress(recipientName, templates!.domains);
        } else {
            recipientName = emails[emails.length - 1].name;
            recipient = emails[emails.length - 1].sender;
        }

        const template = pickRandomListItem(templates!.contents).body;
        const content = getFilledOutTemplate(template, name, recipientName);

        const entry: EmailEntry = {
            name: name,
            sender: sender,
            recipient: recipient,
            content: content,
            template: template,
        };
        setEmails([...emails, entry]);
    };

    const updateTargetEmail = (targetIndex: number, newEmail: EmailEntry) => {
        const newEmails = [...emails];
        newEmails[targetIndex] = newEmail;
        setEmails(newEmails);
    };

    const deleteTargetEmail = (targetIndex: number) => {
        const newEmails = [...emails];
        newEmails.splice(targetIndex, 1);
        setEmails(newEmails);
        setDragging(-1);
        setEditing(-1);

        const deleteButtons = document.querySelectorAll(".delete-entry-btn");
        if (targetIndex > 0) (deleteButtons[targetIndex - 1] as HTMLElement).focus();
    };

    const swapEmailOrder = (targetIndex: number, swapIndex: number) => {
        if (swapIndex < 0 || swapIndex >= emails.length) return;
        const newEmails = [...emails];
        newEmails[targetIndex] = emails[swapIndex];
        newEmails[swapIndex] = emails[targetIndex];
        setEmails(newEmails);
        changeDragging(swapIndex);
    };

    const downloadTable = () => {
        const exportEmails = emails.map((email, idx) => {
            return {
                name: email.name,
                sender: email.sender,
                recipient: email.recipient,
                content: email.content,
                order: idx,
            };
        });
        downloadJSON(exportEmails, "test");
    };

    return (
        <>
            {
                view === AppView.TABLE &&
                <div id="table-wrap">
                    <table id="emails-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Sender</th>
                                <th>Recipient</th>
                                <th>Order</th>
                                <th>Contents</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {emails.map((email, idx) => <EmailRow
                                key={idx}
                                email={email}
                                order={idx}
                                editable={idx === editing}
                                startEditing={() => changeEditing(idx)}
                                endEditing={() => changeEditing(-1)}
                                updateEmail={(newEmail) => updateTargetEmail(idx, newEmail)}
                                deleteEmail={() => deleteTargetEmail(idx)}
                                dragging={idx === dragging}
                                toggleDragging={() => changeDragging(idx)}
                                swapUp={() => swapEmailOrder(idx, idx - 1)}
                                swapDown={() => swapEmailOrder(idx, idx + 1)}
                            />)}
                        </tbody>
                    </table>

                    <div>
                        <IconButton src={AddIcon} text="Add Entry" onClick={addNewEmail} />
                        <IconButton src={GraphIcon} text="View Graph" onClick={() => setView(AppView.GRAPH)} />
                        <IconButton src={UploadIcon} text="Load Table" onClick={() => {}} />
                        <IconButton src={DownloadIcon} text="Save Table" onClick={downloadTable} />
                    </div>
                </div>
            }

            {
                view === AppView.GRAPH && <div id="canvas-wrap">
                    <canvas id="graph-canvas"></canvas>
                    <IconButton src={TableIcon} text="View Table" onClick={() => setView(AppView.TABLE)} />
                </div>
            }

            <a id="downloader" style={{ display: "none" }}></a>
        </>
    )
}

export default App;
