import { useEffect, useRef, useState } from "react";
import EmailRow from "./components/EmailRow";
import IconButton from "./components/IconButton";
import GraphCanvas from "./components/GraphCanvas";
import DropdownButton from "./components/DropdownButton";

import { findLastIndex, getFilledOutTemplate, pickRandomListItem, randomEmailAddress } from "./utils/misc";
import { downloadAsJSON, handleFileUpload, triggerFileUpload } from "./utils/files";
import { Email, EmailEntry, Templates } from "./utils/types";

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
    const names = emails.map(email => email.name);
    
    const emailsSet = new Set<string>();
    emails.forEach(email => {
        emailsSet.add(email.sender);
        emailsSet.add(email.recipient);
    });
    const allEmails: string[] = [...emailsSet];
    
    const [dragging, setDragging] = useState(-1);

    useEffect(() => {
        let debounceTimer: number;
        let accumulatedDigits = "";

        const navigationHandler = (evt: KeyboardEvent) => {
            if (evt.ctrlKey && (evt.key === "b" || evt.key === "B")) {
                // Bring focus to the first button.
                const firstButton = document.getElementById("add-entry-btn") || document.getElementById("view-table-btn");
                firstButton!.focus();
                evt.preventDefault();
                return;
            }

            const editableElements = ["INPUT", "TEXTAREA"];
            if (editableElements.includes(document.activeElement?.nodeName!)) return;
            
            const isNumber = /^[0-9]$/i.test(evt.key);
            if (!isNumber) return;

            const digit = parseInt(evt.key);
            accumulatedDigits += digit;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const emailElements = document.querySelectorAll(".email-row") as NodeListOf<HTMLElement>;
                const targetIndex = parseInt(accumulatedDigits) - 1;
                let target = emailElements[targetIndex];
                accumulatedDigits = "";

                if (targetIndex < 0) return;
                if (targetIndex >= emailElements.length) target = emailElements[emailElements.length - 1];

                // @ts-expect-error The element will exist.
                target.querySelector(".row-icon").focus({ preventScroll: true });
                target.scrollIntoView();
            }, 250);
        };

        window.addEventListener("keydown", navigationHandler);
        return () => window.removeEventListener("keydown", navigationHandler);
    }, []);

    const changeDragging = (target: number) => {
        if (dragging === target) {
            setDragging(-1);
            return;
        }
        setDragging(target);
    };

    const getExistingSender = () => pickRandomListItem(names, [], true);
    const getNewSender = () => pickRandomListItem(templates!.names, names, true);

    const addNewEmail = (name: string, infected?: boolean, type?: string) => {
        const existing = emails.findIndex(email => email.name === name);
        const sender = existing === -1 ? randomEmailAddress(name, templates!.domains) : emails[existing].sender;

        let recipient, recipientName: string;
        if (emails.length < 2) {
            recipientName = pickRandomListItem(templates!.names, [name]);
            recipient = randomEmailAddress(recipientName, templates!.domains);
        } else {
            // recipientName = pickRandomListItem(names, [name], true);
            // recipient = emails.find(email => email.name === recipientName)!.sender;

            const lastEmailIndex = findLastIndex(emails, email => email.name !== name);
            const lastEmail = emails[lastEmailIndex];
            recipientName = lastEmail.name;
            recipient = lastEmail.sender;
        }

        let template;
        const types = Object.keys(templates!.templates);
        const useType = type || pickRandomListItem(types);

        if (infected) template = pickRandomListItem(templates!.payloads);
        else template = pickRandomListItem(templates!.templates[useType]);
        const content = getFilledOutTemplate(template.body, name, recipientName);

        const entry: EmailEntry = {
            name: name,
            sender: sender,
            recipient: recipient,
            subject: template.subject,
            content: content,
            infected: !!infected,
            type: useType,
        };
        setEmails([...emails, entry]);
    };

    const updateTargetEmail = (targetIndex: number, newEmail: EmailEntry) => {
        const newEmails = [...emails];

        const prevEmail = emails[targetIndex];
        const existingMatch = emails.find(email => email.name === newEmail.name);
        if (existingMatch && prevEmail.name !== newEmail.name) newEmail.sender = existingMatch.sender;
        // We check the names don't match so that this autocomplete only happens when editing name,
        // meaning it won't prevent directly editing the sender.

        newEmails[targetIndex] = newEmail;
        setEmails(newEmails);
    };

    const deleteTargetEmail = (targetIndex: number) => {
        const newEmails = [...emails];
        newEmails.splice(targetIndex, 1);
        setEmails(newEmails);
        setDragging(-1);

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
        const rawName = window.prompt("Enter workflow name:");
        if (!rawName) return;
        const newName = rawName.replace(/ /g,"_").toLowerCase();
        setTableName(newName);
    };

    const downloadTable = () => {
        const exportEmails: Email[] = emails.map((email, idx) => {
            return {
                sender: email.sender,
                recipient: email.recipient,
                content: email.content,
                subject: email.subject,
                infected: email.infected,
                type: email.type,
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
        return '"' + prettyName + '"';
    };

    const highlightEmail = emails[dragging];

    return (
        <>
            {/* <th id="table-name">{tableName && formatName(tableName)}</th> */}
            
            {
                view === AppView.TABLE &&
                <div id="table-wrap">
                    <div id="emails-table">
                            {emails.map((email, idx) => <EmailRow
                                key={idx}
                                email={email}
                                order={idx + 1}
                                highlightSender={highlightEmail?.sender}
                                highlightRecipient={highlightEmail?.recipient}
                                allEmails={allEmails}
                                updateEmail={(newEmail) => updateTargetEmail(idx, newEmail)}
                                deleteEmail={() => deleteTargetEmail(idx)}
                                dragging={idx === dragging}
                                toggleDragging={() => changeDragging(idx)}
                                swapUp={() => swapEmailOrder(idx, idx - 1)}
                                swapDown={() => swapEmailOrder(idx, idx + 1)}
                            />)}
                        {emails.length === 0 && <p id="no-emails">No emails to display.</p>}
                    </div>
                    <div id="buttons-wrap">
                        <DropdownButton
                            id="add-entry-btn"
                            src={AddIcon}
                            text="Add Entry"
                            options={[
                                {
                                    id: "new-sender-btn",
                                    src: NewSenderIcon,
                                    text: "New Sender",
                                    callback: () => addNewEmail(getNewSender()),
                                },
                                {
                                    id: "existing-sender-btn",
                                    src: ExistingSenderIcon,
                                    text: "Existing Sender",
                                    callback: () => addNewEmail(getExistingSender()),
                                    disabled: emails.length < 2,
                                },
                                {
                                    id: "infected-sender-btn",
                                    src: InfectedSenderIcon,
                                    text: "Infected Email",
                                    // TODO: Maybe the sender should be a special reserved sender?
                                    callback: () => addNewEmail(getNewSender(), true),
                                },
                            ]}
                        />
                        <DropdownButton
                            id="manage-table-btn"
                            src={ManageIcon}
                            text="Manage Table"
                            options={[
                                {
                                    id: "upload-btn",
                                    src: UploadIcon,
                                    text: "Load Table",
                                    callback: triggerFileUpload,
                                },
                                {
                                    id: "download-btn",
                                    src: DownloadIcon,
                                    text: "Save Table",
                                    callback: downloadTable,
                                    disabled: !tableName,
                                },
                                {
                                    id: "clear-btn",
                                    src: ResetIcon,
                                    text: "Reset Table",
                                    callback: () => setEmails([]),
                                },
                                {
                                    id: "rename-btn",
                                    src: EditIcon,
                                    text: tableName ? "Rename Table" : "Name Table",
                                    callback: renameTable,
                                },
                            ]}
                        />
                        <IconButton
                            id="view-graph-btn"
                            giveRef={viewGraphButton}
                            src={GraphIcon}
                            text="View Graph"
                            onClick={() => setView(AppView.GRAPH)}
                        />
                    </div>
                </div>
            }

            {
                view === AppView.GRAPH && <div id="canvas-wrap">
                    <GraphCanvas emails={emails} />
                    <IconButton
                        id="view-table-btn"
                        giveRef={viewTableButton}
                        src={TableIcon}
                        text="View Table"
                        onClick={() => setView(AppView.TABLE)}
                    />
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
