import { useEffect, useRef } from "react";
import { getButtonBehavior } from "../utils/misc";
import { EmailEntry } from "../utils/types";

import editIcon from "../assets/edit-icon.svg";
import moveIcon from "../assets/move-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";

import "./styles/EmailRow.css";

interface Props {
    email: EmailEntry,
    order: number,
    highlight: boolean,
    editable: boolean,
    startEditing: () => void,
    endEditing: () => void,
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
    highlight,
    editable,
    startEditing,
    endEditing,
    updateEmail,
    deleteEmail,
    dragging,
    toggleDragging,
    swapUp,
    swapDown,
}: Props) {
    const rowRef = useRef<HTMLTableRowElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const senderInputRef = useRef<HTMLInputElement>(null);
    const recipientInputRef = useRef<HTMLInputElement>(null);
    const contentsTextareaRef = useRef<HTMLTextAreaElement>(null);
    const editButtonRef = useRef<HTMLImageElement>(null);
    const dragButtonRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (editable) nameInputRef.current?.focus();
    }, [editable]);

    useEffect(() => {
        const goNextListener = (target: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            target.current?.focus();
            evt.preventDefault();
        };

        const orderedInputs = [nameInputRef, senderInputRef, recipientInputRef, contentsTextareaRef];
        const inputsListeners: any[] = []; // TODO: We could give this a type.
        
        for (let i = 0; i < orderedInputs.length - 1; i++) {
            const input = orderedInputs[i];
            const nextInput = orderedInputs[i + 1];

            const listener = goNextListener(nextInput);
            // @ts-expect-error TODO: Figure out the issue here.
            input.current?.addEventListener("keydown", listener);
            inputsListeners.push(listener);
        }

        const exitContentsTextarea = () => {
            contentsTextareaRef.current?.blur();
            contentsTextareaRef.current?.scrollTo(0, 0);
        };
        const contentsDoneListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            exitContentsTextarea();
            editButtonRef.current?.focus();
            evt.preventDefault();
            endEditing();
        };
        contentsTextareaRef.current?.addEventListener("focusout", exitContentsTextarea);
        contentsTextareaRef.current?.addEventListener("keydown", contentsDoneListener);
        
        return () => {
            for (let i = 0; i < orderedInputs.length - 1; i++) {
                const input = orderedInputs[i];
                const listener = inputsListeners[i];
                
                input.current?.removeEventListener("keydown", listener);
            }
            
            contentsTextareaRef.current?.removeEventListener("focusout", exitContentsTextarea);
            contentsTextareaRef.current?.removeEventListener("keydown", contentsDoneListener);
        };
    }, []);

    useEffect(() => {
        const tableElement = document.querySelector("table") as HTMLTableElement;
        const wholeRowListener = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                senderInputRef.current?.blur();
                recipientInputRef.current?.blur();
                contentsTextareaRef.current?.blur();
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

    const getUpdater = (prop: keyof EmailEntry) => (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editable) return;
        updateEmail({
            ...email,
            [prop]: evt.target.value,
        });
    };

    const triggerEditing = () => {
        startEditing();
        if (!editable) senderInputRef.current?.focus();
    };

    let className = "";
    if (dragging) className += " dragging";
    if (editable) className += " editable";
    if (highlight) className += " highlight";

    return (
        <tr ref={rowRef} className={className}>
            <td className="cell-name">
                <input ref={nameInputRef} value={email.name} onChange={getUpdater("name")} disabled={!editable}></input>
            </td>
            <td className="cell-sender">
                <input ref={senderInputRef} value={email.sender} onChange={getUpdater("sender")} disabled={!editable}></input>
            </td>
            <td className="cell-recipient">
                <input ref={recipientInputRef} value={email.recipient} onChange={getUpdater("recipient")} disabled={!editable}></input>
            </td>
            <td className="cell-order">{order}</td>
            <td className="cell-contents">
                <textarea ref={contentsTextareaRef} value={email.content} onChange={getUpdater("content")} disabled={!editable}></textarea>
            </td>
            <td>
                <img
                    {...getButtonBehavior(triggerEditing)}
                    className="row-icon edit-entry-btn"
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
            </td>
        </tr>
    );
}