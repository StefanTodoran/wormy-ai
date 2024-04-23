import { useEffect, useRef } from "react";
import { getButtonBehavior } from "../utils/misc";
import { Email } from "../utils/types";

import editIcon from "../assets/edit-icon.svg";
import moveIcon from "../assets/move-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";

import "./styles/EmailEntry.css";

interface Props extends Email {
    editable: boolean,
    startEditing: () => void,
    endEditing: () => void,
    updateEmail: (newEmail: Email) => void,
    deleteEmail: () => void,
    dragging: boolean,
    toggleDragging: () => void,
    swapUp: () => void,
    swapDown: () => void,
}

export default function EmailEntry({
    sender,
    recipient,
    content,
    order,
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
    const senderInputRef = useRef<HTMLInputElement>(null);
    const recipientInputRef = useRef<HTMLInputElement>(null);
    const contentsInputRef = useRef<HTMLInputElement>(null);
    const dragButtonRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (editable) senderInputRef.current?.focus();
    }, [editable]);

    useEffect(() => {
        const goNextListener = (target: React.MutableRefObject<any>) => (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            target.current?.focus();
            evt.preventDefault();
        };

        const senderNextListener = goNextListener(recipientInputRef);
        senderInputRef.current?.addEventListener("keydown", senderNextListener);

        const recipientNextListener = goNextListener(contentsInputRef);
        recipientInputRef.current?.addEventListener("keydown", recipientNextListener);

        const contentsDoneListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            contentsInputRef.current?.blur();
            evt.preventDefault();
        };
        contentsInputRef.current?.addEventListener("keydown", contentsDoneListener);

        const tableElement = document.querySelector("table") as HTMLTableElement;
        const wholeRowListener = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                senderInputRef.current?.blur();
                recipientInputRef.current?.blur();
                contentsInputRef.current?.blur();
                evt.preventDefault();
                endEditing();
            }

            if (dragging && evt.key === "ArrowUp") {
                swapUp();
                tableElement.scrollBy(0, -rowRef.current!.clientHeight);
                evt.preventDefault();
            }
            if (dragging && evt.key === "ArrowDown") {
                swapDown();
                tableElement.scrollBy(0, rowRef.current!.clientHeight);
                evt.preventDefault();
            }
        };
        rowRef.current?.addEventListener("keydown", wholeRowListener);
        
        if (dragging) {
            dragButtonRef.current?.focus();
            dragButtonRef.current?.addEventListener("focusout", toggleDragging);
        }
        
        return () => {
            senderInputRef.current?.removeEventListener("keydown", senderNextListener);
            recipientInputRef.current?.removeEventListener("keydown", recipientNextListener);
            contentsInputRef.current?.removeEventListener("keydown", contentsDoneListener);
            rowRef.current?.removeEventListener("keydown", wholeRowListener);
            if (dragging) dragButtonRef.current?.removeEventListener("focusout", toggleDragging);
        };
    }, [dragging]);

    const getUpdater = (prop: keyof Email) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        if (!editable) return;
        updateEmail({
            sender: sender,
            recipient: recipient,
            content: content,
            order: order,
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

    return (
        <tr ref={rowRef} className={className}>
            <td className="cell-sender">
                <input ref={senderInputRef} value={sender} onChange={getUpdater("sender")} disabled={!editable}></input>
            </td>
            <td className="cell-recipient">
                <input ref={recipientInputRef} value={recipient} onChange={getUpdater("recipient")} disabled={!editable}></input>
            </td>
            <td className="cell-order">{order}</td>
            <td className="cell-contents">
                <input ref={contentsInputRef} value={content} onChange={getUpdater("content")} disabled={!editable}></input>
            </td>
            <td>
                <img
                    {...getButtonBehavior(triggerEditing)}
                    className="row-icon edit-entry-btn"
                    src={editIcon}
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