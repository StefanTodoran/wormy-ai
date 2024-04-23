import { useEffect, useRef } from "react";
import { Email } from "../utils/types";

import editIcon from "../assets/edit-icon.svg";
import moveIcon from "../assets/move-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";
import { getButtonBehavior } from "../utils/misc";

interface Props extends Email {
    editable: boolean,
    startEditing: () => void,
    endEditing: () => void,
    updateEmail: (newEmail: Email) => void,
    deleteEmail: () => void,
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
}: Props) {
    const rowRef = useRef<HTMLTableRowElement>(null);
    const senderInputRef = useRef<HTMLInputElement>(null);
    const recipientInputRef = useRef<HTMLInputElement>(null);
    const contentsInputRef = useRef<HTMLInputElement>(null);

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
        
        const rowDoneListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Escape") return;
            senderInputRef.current?.blur();
            recipientInputRef.current?.blur();
            contentsInputRef.current?.blur();
            evt.preventDefault();
            endEditing();
        };
        rowRef.current?.addEventListener("keydown", rowDoneListener);
        
        return () => {
            senderInputRef.current?.removeEventListener("keydown", senderNextListener);
            recipientInputRef.current?.removeEventListener("keydown", recipientNextListener);
            contentsInputRef.current?.removeEventListener("keydown", contentsDoneListener);
            rowRef.current?.removeEventListener("keydown", rowDoneListener);
        };
    }, []);

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
        senderInputRef.current?.focus();
    };

    return (
        <tr ref={rowRef}>
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
                <img {...getButtonBehavior(triggerEditing)} className="row-icon edit-entry-btn" src={editIcon} />
                <img className="row-icon move-entry-btn" src={moveIcon} />
                <img {...getButtonBehavior(deleteEmail)} className="row-icon delete-entry-btn" src={deleteIcon} />
            </td>
        </tr>
    );
}