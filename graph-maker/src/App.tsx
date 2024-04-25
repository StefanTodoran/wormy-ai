import { useEffect, useRef, useState } from "react";
import EmailRow from "./components/EmailRow";
import IconButton from "./components/IconButton";
import GraphCanvas from "./components/GraphCanvas";
import DropdownButton from "./components/DropdownButton";

import { getFilledOutTemplate, pickRandomListItem, randomEmailAddress } from "./utils/misc";
import { downloadAsJSON, handleFileUpload, triggerFileUpload } from "./utils/files";
import { EmailEntry, Templates } from "./utils/types";

import AddIcon from "./assets/add-icon.svg";
import GraphIcon from "./assets/graph-icon.svg";
import TableIcon from "./assets/table-icon.svg";
import UploadIcon from "./assets/upload-icon.svg";
import DownloadIcon from "./assets/download-icon.svg";
import ManageIcon from "./assets/manage-icon.svg";
import EditIcon from "./assets/edit-icon.svg";
import ResetIcon from "./assets/clear-icon.svg";
import NewSenderIcon from "./assets/new-sender-icon.svg";
import ExistingSenderIcon from "./assets/existing-sender-icon.svg";
import InfectedSenderIcon from "./assets/infected-sender-icon.svg";
import "./App.css";

enum AppView {
    TABLE,
    GRAPH,
}

function App() {
    const [view, setView] = useState(AppView.TABLE);

    const viewGraphButton = useRef<HTMLButtonElement>(null);
    const viewTableButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        viewGraphButton.current?.focus();
        viewTableButton.current?.focus();
    }, [view]);

    const [templates, setTemplates] = useState<Templates>();
    useEffect(() => {
        fetch("./templates.json")
            .then(res => res.json())
            .then(json => setTemplates(json))
            .catch(err => console.error(err));
    }, [])

    const [emails, setEmails] = useState<EmailEntry[]>([]);
    const [editing, setEditing] = useState(-1);
    const [dragging, setDragging] = useState(-1);

    useEffect(() => {
        let debounceTimer: number;
        let accumulatedDigits = "";

        const navigationHandler = (evt: KeyboardEvent) => {
            if (evt.key === "b" || evt.key === "B") {
                document.getElementById("first-menu-button")!.focus();
                return;
            }

            const isNumber = /^[0-9]$/i.test(evt.key);
            if (!isNumber) return;

            const digit = parseInt(evt.key);
            accumulatedDigits += digit;
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const emailElements = document.querySelectorAll("tbody > tr") as NodeListOf<HTMLElement>;
                const targetIndex = parseInt(accumulatedDigits) - 1;
                let target = emailElements[targetIndex];
                accumulatedDigits = "";
                
                if (targetIndex < 0) return;
                if (targetIndex >= emailElements.length) target = emailElements[emailElements.length - 1];
                
                // @ts-expect-error The element will exist.
                target.querySelector(".edit-entry-btn").focus({ preventScroll: true });
                target.scrollIntoView();
            }, 250);
        };

        window.addEventListener("keydown", navigationHandler);
        return () => window.removeEventListener("keydown", navigationHandler);
    }, []);

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

    const getExistingSender = () => {
        const names = emails.map(email => email.name);
        const name = pickRandomListItem(names, [], true);
        return name;
    };
    
    const getNewSender = () => {
        const names = emails.map(email => email.name);
        const name = pickRandomListItem(templates!.names, names, true);
        return name;
    };

    const addNewEmail = (name: string, infected?: boolean) => {
        const existing = emails.findIndex(email => email.name === name);
        const sender = existing === -1 ? randomEmailAddress(name, templates!.domains) : emails[existing].sender;

        let recipient, recipientName: string;
        if (emails.length < 2) {
            recipientName = pickRandomListItem(templates!.names, [name]);
            recipient = randomEmailAddress(recipientName, templates!.domains);
        } else {
            // const allNames = emails.map(email => email.name);
            // recipientName = pickRandomListItem(allNames, [name], true);
            // recipient = emails.find(email => email.name === recipientName)!.sender;
            
            recipientName = emails[emails.length - 1].name;
            recipient = emails[emails.length - 1].sender;
        }

        let template;
        if (infected) template = pickRandomListItem(templates!.payloads);
        else template = pickRandomListItem(templates!.contents).body;
        const content = getFilledOutTemplate(template, name, recipientName);

        const entry: EmailEntry = {
            name: name,
            sender: sender,
            recipient: recipient,
            content: content,
            template: template,
            infected: !!infected,
        };
        setEmails([...emails, entry]);
    };

    const updateTargetEmail = (targetIndex: number, newEmail: EmailEntry) => {
        const newEmails = [...emails];
        const existingMatch = emails.find(email => email.name === newEmail.name);
        if (existingMatch) newEmail.sender = existingMatch.sender;

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

    const renameTable = () => {
        const newName = window.prompt("Enter workflow name:");
        if (newName) setTableName(newName);
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

        const exportData = { name: tableName, emails: exportEmails };
        downloadAsJSON(exportData, tableName!);
    };

    const [tableName, setTableName] = useState<string>("");
    const formatName = (rawName: string) => {
        const words = rawName.split("_").map(word => word[0].toUpperCase() + word.slice(1));
        const prettyName = words.join(" ");
        return prettyName;
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
                                <th id="table-name">{tableName && formatName(tableName)}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {emails.map((email, idx) => <EmailRow
                                key={idx}
                                email={email}
                                order={idx + 1}
                                highlight={
                                    (editing !== -1 && idx !== editing && email.name === emails[editing].name) ||
                                    (dragging !== -1 && idx !== dragging && email.name === emails[dragging].name)
                                }
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

                        {emails.length === 0 && <p id="no-emails">No emails to display.</p>}
                    </table>

                    <div>
                        <DropdownButton
                            id="first-menu-button"
                            src={AddIcon}
                            text="Add Entry"
                            options={[
                                {
                                    src: NewSenderIcon,
                                    text: "New Sender",
                                    callback: () => addNewEmail(getNewSender()),
                                },
                                {
                                    src: ExistingSenderIcon,
                                    text: "Existing Sender",
                                    callback: () => addNewEmail(getExistingSender()),
                                    disabled: emails.length === 0,
                                },
                                {
                                    src: InfectedSenderIcon,
                                    text: "Infected Email",
                                    // TODO: Maybe the sender should be a special reserved sender?
                                    callback: () => addNewEmail(getNewSender(), true),
                                },
                            ]}
                        />
                        <DropdownButton
                            src={ManageIcon}
                            text="Manage Table"
                            options={[
                                {
                                    src: UploadIcon,
                                    text: "Load Table",
                                    callback: triggerFileUpload,
                                },
                                {
                                    src: DownloadIcon,
                                    text: "Save Table",
                                    callback: downloadTable,
                                    disabled: !tableName,
                                },
                                {
                                    src: ResetIcon,
                                    text: "Reset Table",
                                    callback: () => setEmails([]),
                                },
                                {
                                    src: EditIcon,
                                    text: tableName ? "Rename Table" : "Name Table",
                                    callback: renameTable,
                                },
                            ]}
                        />
                        <IconButton
                            src={GraphIcon}
                            text="View Graph"
                            onClick={() => setView(AppView.GRAPH)}
                            giveRef={viewGraphButton}
                        />
                    </div>
                </div>
            }

            {
                view === AppView.GRAPH && <div id="canvas-wrap">
                    <GraphCanvas emails={emails} />
                    <IconButton giveRef={viewTableButton} src={TableIcon} text="View Table" onClick={() => setView(AppView.TABLE)} />
                </div>
            }

            <a id="downloader" style={{ display: "none" }}></a>
            <input
                id="importer"
                type="file"
                style={{ display: "none" }}
                onInput={() => handleFileUpload((fileData: any) => {
                    setTableName(fileData.name);
                    setEmails(fileData.emails);
                })}
            />
        </>
    )
}

export default App;
