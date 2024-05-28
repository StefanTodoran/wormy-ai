import { useEffect, useRef, useState } from "react";
import EmailRow from "./components/EmailRow";
import IconButton from "./components/IconButton";
import GraphCanvas from "./components/GraphCanvas";
import DropdownButton from "./components/DropdownButton";
import FancyInput from "./components/FancyInput";
import NumericInput from "./components/NumericInput";
import Modal from "./components/Modal";
import NewEmail from "./components/NewEmail";

// import { findLastIndex, getFilledOutTemplate, pickRandomListItem, randomEmailAddress } from "./utils/misc";
import { downloadAsJSON, handleFileUpload, triggerFileUpload } from "./utils/files";
import { createRandomName, getFilledOutTemplate } from "./utils/misc";
import { EmailEntry, SimulationRound, Templates } from "./utils/types";

import AddIcon from "./assets/add-icon.svg";
import GraphIcon from "./assets/graph-icon.svg";
import TableIcon from "./assets/table-icon.svg";
import UploadIcon from "./assets/upload-icon.svg";
import DownloadIcon from "./assets/download-icon.svg";
import RefreshIcon from "./assets/refresh-icon.svg";
import ManageIcon from "./assets/manage-icon.svg";
import ResetIcon from "./assets/clear-icon.svg";

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
    const fetchTemplates = () => {
        fetch("./templates.json")
            .then(res => res.json())
            .then(json => setTemplates(json))
            .catch(err => console.error(err));
    };
    useEffect(fetchTemplates, []);

    const [shownRound, setShownRound] = useState(0);
    const [rounds, setRounds] = useState<SimulationRound[]>([]);

    const [emails, setEmails] = useState<EmailEntry[]>([]);
    const names = emails.map(email => email.name);

    useEffect(() => {
        if (shownRound < rounds.length) setEmails(rounds[shownRound].emails);
    }, [shownRound]);

    const emailsSet = new Set<string>();
    emails.forEach(email => {
        emailsSet.add(email.sender);
        emailsSet.add(email.recipient);
    });
    const allEmails: string[] = [...emailsSet];

    const [dragging, setDragging] = useState(-1);
    const [editing, setEditing] = useState(-1);

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

    const changeEditing = (target: number) => {
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

    const insertNewEmail = (index: number, email: EmailEntry) => {
        const newEmails = [...emails];
        newEmails.splice(index, 0, email);
        setEmails(newEmails);

        setTimeout(() => {
            const emailElements = document.querySelectorAll(".email-row") as NodeListOf<HTMLElement>;
            emailElements[index].scrollIntoView();
        }, 100);
    };

    /*
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
    */

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
        setEditing(-1);
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

    const [tableName, setTableName] = useState<string>("");

    const resetTable = () => {
        setEmails([]);
        setRounds([]);
        setShownRound(0)
        setTableName("");
        setDragging(-1);
        setEditing(-1);
    };

    const downloadTable = () => {
        const exportEmails = emails.map((email, idx) => {
            let recipientName = emails.find(other => other.sender === email.recipient)?.name;
            if (!recipientName) {
                const randomName = createRandomName(templates!.firstNames, templates!.lastNames, [email.name]);
                recipientName = randomName;
            }

            const filledContent = getFilledOutTemplate(email.content, email.name, recipientName);
            return {
                ...email,
                content: filledContent,
                order: idx,
            };
        });

        const exportData = { name: tableName, emails: exportEmails };
        const fileName = tableName.toLowerCase().replace(/ /g, "_");
        downloadAsJSON(exportData, fileName);
    };

    const highlightEmail = emails[dragging] || emails[editing];
    const [searchQuery, setSearchQuery] = useState("");

    let filteredEmails = emails;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEmails = emails.filter(email => {
            return email.sender.toLowerCase().includes(query) ||
                email.recipient.toLowerCase().includes(query) ||
                email.subject.toLowerCase().includes(query) ||
                email.content.toLowerCase().includes(query);
        });
    }

    const allTypes = templates ? Object.keys(templates.templates).concat("worm") : [];
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            {
                view === AppView.TABLE &&
                <div id="table-wrap">
                    <div id="emails-table">
                        <div id="table-controls">
                            <FancyInput label="Search" value={searchQuery} setValue={setSearchQuery} searchKey={"/"} />
                            <FancyInput label="Table Name" value={tableName} setValue={setTableName} />

                            {
                                rounds.length > 0 &&
                                <NumericInput
                                    label="Simulation Round"
                                    value={shownRound}
                                    setValue={setShownRound}
                                    minValue={0}
                                    maxValue={rounds.length - 1}
                                    customClass="quarter-length"
                                    showSteppers
                                />
                            }
                        </div>

                        {filteredEmails.map((email, idx) => <EmailRow
                            key={idx}
                            email={email}
                            order={idx + 1}
                            highlightSender={highlightEmail?.sender}
                            highlightRecipient={highlightEmail?.recipient}
                            allEmails={allEmails}
                            allTypes={allTypes}
                            updateEmail={(newEmail) => updateTargetEmail(idx, newEmail)}
                            deleteEmail={() => deleteTargetEmail(idx)}
                            editing={idx === editing}
                            startEditing={() => changeEditing(idx)}
                            endEditing={() => changeEditing(-1)}
                            dragging={idx === dragging}
                            toggleDragging={() => changeDragging(idx)}
                            swapUp={() => swapEmailOrder(idx, idx - 1)}
                            swapDown={() => swapEmailOrder(idx, idx + 1)}
                        />)}
                        {filteredEmails.length === 0 && <p id="no-emails">No emails to display.</p>}
                    </div>
                    <div id="buttons-wrap">
                        <IconButton
                            id="add-entry-btn"
                            text="Add Entry"
                            src={AddIcon}
                            onClick={() => setModalOpen(true)}
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
                                    id: "refresh-btn",
                                    src: RefreshIcon,
                                    text: "Refresh Templates",
                                    callback: fetchTemplates,
                                },
                                {
                                    id: "clear-btn",
                                    src: ResetIcon,
                                    text: "Reset Table",
                                    callback: resetTable,
                                },
                                // {
                                //     id: "rename-btn",
                                //     src: EditIcon,
                                //     text: tableName ? "Rename Table" : "Name Table",
                                //     callback: renameTable,
                                // },
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

            {templates && <Modal open={modalOpen} setOpen={setModalOpen}>
                <NewEmail
                    maxOrder={emails.length}
                    insertEmail={insertNewEmail}
                    toggleModal={() => setModalOpen(false)}
                    allEmails={allEmails}
                    allTypes={allTypes}
                    existingNames={names}
                    templates={templates}
                />
            </Modal>}

            <a id="downloader" style={{ display: "none" }}></a>
            <input
                id="importer"
                type="file"
                style={{ display: "none" }}
                onInput={() => handleFileUpload((fileData: any) => {
                    if ("rounds" in fileData) {
                        setTableName(fileData.name);
                        setRounds(fileData.rounds);
                        setEmails(fileData.rounds[0].emails);
                    } else {
                        setTableName(fileData.name);
                        setEmails(fileData.emails);
                    }
                })}
            />
        </>
    )
}

export default App;
