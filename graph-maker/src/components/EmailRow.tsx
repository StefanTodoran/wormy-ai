import { useEffect, useRef } from "react";
import { getButtonBehavior } from "../utils/misc";
import { EmailEntry } from "../utils/types";
import AutocompleteInput from "./AutocompleteInput";
import FancyInput from "./FancyInput";

import editIcon from "../assets/edit-icon.svg";
import moveIcon from "../assets/move-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";

import "./styles/EmailRow.css";

interface Props {
    email: EmailEntry,
    order: number,
    highlightSender: string,
    highlightRecipient: string,
    allEmails: string[],
    allTypes: string[],
    updateEmail: (newEmail: EmailEntry) => void,
    deleteEmail: () => void,
    editing: boolean,
    startEditing: () => void,
    endEditing: () => void,
    dragging: boolean,
    toggleDragging: () => void,
    swapUp: () => void,
    swapDown: () => void,
    collapsed?: boolean,
    odd?: boolean,
}

export default function EmailRow({
    email,
    order,
    highlightSender,
    highlightRecipient,
    allEmails,
    allTypes,
    updateEmail,
    deleteEmail,
    editing,
    startEditing,
    endEditing,
    dragging,
    toggleDragging,
    swapUp,
    swapDown,
    collapsed,
    odd,
}: Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const senderRef = useRef<HTMLInputElement>(null);
    const recipientRef = useRef<HTMLInputElement>(null);
    const subjectRef = useRef<HTMLInputElement>(null);
    const contentsRef = useRef<HTMLTextAreaElement>(null);

    const editButtonRef = useRef<HTMLImageElement>(null);
    const dragButtonRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const exitContentsTextarea = () => {
            contentsRef.current?.blur();
            contentsRef.current?.scrollTo(0, 0);
        };
        const contentsDoneListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            exitContentsTextarea();
            editButtonRef.current?.focus();
            evt.preventDefault();
            endEditing();
        };

        contentsRef.current?.addEventListener("focusout", exitContentsTextarea);
        contentsRef.current?.addEventListener("keydown", contentsDoneListener);

        return () => {
            contentsRef.current?.removeEventListener("focusout", exitContentsTextarea);
            contentsRef.current?.removeEventListener("keydown", contentsDoneListener);
        };
    }, []);

    useEffect(() => {
        const tableElement = document.getElementById("emails-table")!;
        const wholeRowListener = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                editButtonRef.current?.focus();
                evt.preventDefault();
                if (dragging) toggleDragging();
                endEditing();
            }

            if (dragging && evt.key === "ArrowUp") {
                swapUp();
                // The scroll amount is off because the current element is focused,
                // we should scroll by the height of an unfocused element.
                tableElement.scrollBy(0, -rowRef.current!.clientHeight * 0.5);
                evt.preventDefault();
            }
            if (dragging && evt.key === "ArrowDown") {
                swapDown();
                tableElement.scrollBy(0, rowRef.current!.clientHeight * 0.5);
                evt.preventDefault();
            }
        };
        rowRef.current?.addEventListener("keydown", wholeRowListener);

        if (dragging) {
            dragButtonRef.current?.focus();
            dragButtonRef.current?.addEventListener("focusout", toggleDragging);
        }

        return () => {
            rowRef.current?.removeEventListener("keydown", wholeRowListener);
            if (dragging) dragButtonRef.current?.removeEventListener("focusout", toggleDragging);
        };
    }, [dragging]);

    const toggleEditing = () => {
        if (!editing) startEditing();
        else endEditing();
    }

    const getUpdater = (prop: keyof EmailEntry) => (value: string) => {
        updateEmail({
            ...email,
            [prop]: value,
        });
    };

    let className = "email-row";
    if (editing) className += " editing";
    if (dragging) className += " dragging";
    if (email.infected) className += " infected";
    if (collapsed) className += " collapsed";

    if (odd) className += " odd-row";
    else className += " even-row";

    if (highlightSender === email.sender) className += " highlight-sender";
    if (highlightRecipient === email.sender) className += " highlight-sender-alt";
    if ((editing || dragging) && highlightRecipient === email.recipient) className += " highlight-recipient";

    return (
        <div ref={rowRef} className={className}>
            <div className="summary-row">
                <div className="cell cell-order">{order}</div>
                <div className="cell cell-sender">
                    <AutocompleteInput
                        label="Sender"
                        giveRef={senderRef}
                        value={email.sender}
                        setValue={getUpdater("sender")}
                        candidates={allEmails}
                        disabled={!editing}
                    />
                </div>
                <div className="cell cell-recipient">
                    <AutocompleteInput
                        label="Recipient"
                        giveRef={recipientRef}
                        value={email.recipient}
                        setValue={getUpdater("recipient")}
                        candidates={allEmails}
                        disabled={!editing}
                    />
                </div>
                <div className="cell cell-subject">
                    <FancyInput
                        label="Subject"
                        giveRef={subjectRef}
                        value={email.subject}
                        setValue={getUpdater("subject")}
                        disabled={!editing}
                    />
                </div>
                <img
                    {...getButtonBehavior(toggleEditing)}
                    className={"row-icon edit-entry-btn"}
                    src={editIcon}
                    ref={editButtonRef}
                />
                <img
                    {...getButtonBehavior(toggleDragging)}
                    className={"row-icon move-entry-btn"}
                    src={moveIcon}
                    ref={dragButtonRef}
                />
                <img
                    {...getButtonBehavior(deleteEmail)}
                    className="row-icon delete-entry-btn"
                    src={deleteIcon}
                />
            </div>

            <div className="details-row">
                <div className="cell cell-type">
                    <AutocompleteInput
                        label="Type"
                        value={email.type}
                        setValue={getUpdater("type")}
                        candidates={allTypes}
                    />
                </div>
                <div className="cell cell-contents">
                    <FancyInput
                        label="Body"
                        giveRef={contentsRef}
                        value={email.content}
                        setValue={getUpdater("content")}
                        disabled={!editing}
                        useTextarea
                    />
                </div>
            </div>
        </div>
    );
}