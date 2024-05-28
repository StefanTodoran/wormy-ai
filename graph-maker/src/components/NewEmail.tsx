import { useEffect, useRef, useState } from "react";
import { ContentTemplate, EmailEntry, PayloadTemplate, Templates } from "../utils/types";
import { getButtonBehavior, pickRandomListItem, randomEmailAddress } from "../utils/misc";

import AutocompleteInput from "./AutocompleteInput";
import FancyInput from "./FancyInput";
import IconButton from "./IconButton";

import refreshIcon from "../assets/refresh-icon.svg";
import confirmIcon from "../assets/confirm-icon.svg";
import deleteIcon from "../assets/delete-icon.svg";
import "./styles/NewEmail.css";

interface Props {
    maxOrder: number,
    insertEmail: (index: number, email: EmailEntry) => void,
    toggleModal: () => void,
    allEmails: string[],
    allTypes: string[],
    existingNames: string[],
    templates: Templates,
}

export default function NewEmail({
    maxOrder,
    insertEmail,
    toggleModal,
    allEmails,
    allTypes,
    existingNames,
    templates,
}: Props) {
    const firstInput = useRef<HTMLInputElement>(null);
    useEffect(() => firstInput.current?.focus(), []);

    const [email, setEmail] = useState<EmailEntry>({
        name: "",
        sender: "",
        recipient: "",
        subject: "",
        content: "",
        infected: false,
        type: "",
    });

    const [order, setOrder] = useState(maxOrder);
    const changeOrder = (rawNewOrder: string) => {
        const newOrder = parseInt(rawNewOrder.replace(/\D/g, ""));
        if (Number.isNaN(newOrder)) setOrder(0);
        else setOrder(Math.max(0, Math.min(newOrder, maxOrder + 1)));
    };

    const getUpdater = (prop: keyof EmailEntry) => (value: string) => {
        setEmail({
            ...email,
            [prop]: value,
        });
    };
    
    const updateType = (newType: string) => {
        setEmail({
            ...email,
            type: newType,
            infected: newType === "worm",
        });
    };

    let templatesOfType: ContentTemplate[] | PayloadTemplate[] = [];
    if (email.type === "worm") templatesOfType = templates.payloads;
    if (email.type in templates.templates) templatesOfType = templates.templates[email.type];
    const validSubjects = templatesOfType.map(template => template.subject);

    const updateSubject = (newSubject: string) => {
        const index = templatesOfType.findIndex(template => template.subject === newSubject);
        const content = index !== -1 ? templatesOfType[index].body : email.content;
        const wormVariant = index !== -1 && email.type === "worm" ? (templatesOfType[index] as PayloadTemplate).type : undefined;

        setEmail({
            ...email,
            subject: newSubject,
            content: content,
            worm_variant: wormVariant,
        });
    };

    const randomizeEmailAdress = () => {
        const randomName = pickRandomListItem(templates.names, existingNames);
        const address = randomEmailAddress(randomName, templates!.domains);
        setEmail({
            ...email,
            name: randomName,
            sender: address,
        });
    }

    let className = "new-email";
    if (email.infected) className += " infected";

    return (
        <div className={className}>
            <div className="row">
                <div className="cell cell-order">
                    <FancyInput
                        giveRef={firstInput}
                        label="Order"
                        value={order.toString()}
                        setValue={changeOrder}
                    />
                </div>
                <div className="cell cell-sender">
                    <AutocompleteInput
                        label="Sender"
                        value={email.sender}
                        setValue={getUpdater("sender")}
                        candidates={allEmails}
                    />
                </div>
                <img
                    {...getButtonBehavior(randomizeEmailAdress)}
                    className="row-icon randomize-sender-btn"
                    src={refreshIcon}
                />
                <div className="cell cell-recipient">
                    <AutocompleteInput
                        label="Recipient"
                        value={email.recipient}
                        setValue={getUpdater("recipient")}
                        candidates={allEmails}
                    />
                </div>
            </div>

            <div className="row">
                <div className="cell cell-type">
                    <AutocompleteInput
                        label="Type"
                        value={email.type}
                        setValue={updateType}
                        candidates={allTypes}
                    />
                </div>
                <div className="cell cell-subject">
                    <AutocompleteInput
                        label="Subject"
                        value={email.subject}
                        setValue={updateSubject}
                        candidates={validSubjects}
                    />
                </div>
            </div>

            <div className="row">
                <div className="cell cell-content">
                    <FancyInput
                        label="Body"
                        value={email.content}
                        setValue={getUpdater("content")}
                        useTextarea
                    />
                </div>
            </div>

            <div className="row">
                <IconButton
                    src={deleteIcon}
                    text="Cancel"
                    onClick={toggleModal}
                    customClass="cancel-entry-btn"
                    />
                <IconButton
                    src={confirmIcon}
                    text="Confirm"
                    customClass="confirm-entry-btn"
                    onClick={() => {
                        insertEmail(order, email);
                        toggleModal();
                    }}
                />
            </div>
        </div>
    );
}