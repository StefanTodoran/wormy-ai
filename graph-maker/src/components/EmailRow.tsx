import { useEffect, useRef } from "react";
import { getButtonBehavior } from "../utils/misc";
import { EmailEntry } from "../utils/types";
import AutocompleteInput from "./AutocompleteInput";

import moveIcon from "../assets/move-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";

import "./styles/EmailRow.css";

interface Props {
    email: EmailEntry,
    order: number,
    highlightSender: string,
    highlightRecipient: string,
    allEmails: string[],
    updateEmail: (newEmail: EmailEntry) => void,
    deleteEmail: () => void,
    dragging: boolean,
    toggleDragging: () => void,
    swapUp: () => void,
    swapDown: () => void,
}

export default function EmailRow({
    email,
    order,
    highlightSender,
    highlightRecipient,
    allEmails,
    updateEmail,
    deleteEmail,
    dragging,
    toggleDragging,
    swapUp,
    swapDown,
}: Props) {
    const rowRef = useRef<HTMLTableRowElement>(null);
    const senderInputRef = useRef<HTMLInputElement>(null);
    const recipientInputRef = useRef<HTMLInputElement>(null);
    const contentsTextareaRef = useRef<HTMLTextAreaElement>(null);
    const editButtonRef = useRef<HTMLImageElement>(null);
    const dragButtonRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const exitContentsTextarea = () => {
            contentsTextareaRef.current?.blur();
            contentsTextareaRef.current?.scrollTo(0, 0);
        };
        const contentsDoneListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            exitContentsTextarea();
            editButtonRef.current?.focus();
            evt.preventDefault();
        };

        contentsTextareaRef.current?.addEventListener("focusout", exitContentsTextarea);
        contentsTextareaRef.current?.addEventListener("keydown", contentsDoneListener);

        return () => {
            contentsTextareaRef.current?.removeEventListener("focusout", exitContentsTextarea);
            contentsTextareaRef.current?.removeEventListener("keydown", contentsDoneListener);
        };
    }, []);

    useEffect(() => {
        const tableElement = document.getElementById("emails-table")!;
        const wholeRowListener = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                senderInputRef.current?.blur();
                recipientInputRef.current?.blur();
                contentsTextareaRef.current?.blur();
                
                evt.preventDefault();
                if (dragging) toggleDragging();
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

    const getUpdater = (prop: keyof EmailEntry) => (value: string) => {
        updateEmail({
            ...email,
            [prop]: value,
        });
    };

    const getOnChange = (prop: keyof EmailEntry) => (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateEmail({
            ...email,
            [prop]: evt.target.value,
        });
    };

    let className = "email-row";
    if (dragging) className += " dragging";
    if (email.infected) className += " infected";

    if (highlightSender === email.sender) className += " highlight-sender";
    if (highlightRecipient === email.sender) className += " highlight-sender-alt";
    if (dragging && highlightRecipient === email.recipient) className += " highlight-recipient";

    return (
        <div ref={rowRef} className={className}>
            <div className="cell cell-sender">
                <AutocompleteInput
                    giveRef={senderInputRef}
                    value={email.sender}
                    setValue={getUpdater("sender")}
                    candidates={allEmails}
                />
            </div>
            <div className="cell cell-recipient">
                <AutocompleteInput
                    giveRef={recipientInputRef}
                    value={email.recipient}
                    setValue={getUpdater("recipient")}
                    candidates={allEmails}
                />
            </div>
            <div className="cell cell-order">{order}</div>
            <div className="cell cell-subject">
                <textarea value={email.subject} onChange={getOnChange("subject")}></textarea>
            </div>
            <div className="cell cell-contents">
                <textarea ref={contentsTextareaRef} value={email.content} onChange={getOnChange("content")}></textarea>
            </div>
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
    );
}