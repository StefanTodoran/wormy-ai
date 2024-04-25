import { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";
import "./styles/DropdownButton.css";

interface DropdownOption {
    src?: string,
    text: string,
    callback: () => void,
    disabled?: boolean,
}

interface Props {
    id?: string,
    src: string,
    text: string,
    options: DropdownOption[],
}

export default function DropdownButton({
    id,
    src,
    text,
    options,
}: Props) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const firstOptionRef = useRef<HTMLButtonElement>(null);
    const mainButtonRef = useRef<HTMLButtonElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dropdownOpen) return;
        setTimeout(() => firstOptionRef.current?.focus(), 50);

        const closeDropdownOnEscape = (evt: KeyboardEvent) => {
            if (evt.key === "Escape") {
                setDropdownOpen(false);
                mainButtonRef.current?.focus();
            }
        };
        const closeDropdownOnUnfocus = (evt: FocusEvent) => {
            // @ts-expect-error This works, TypeScript is just dumb.
            if (!wrapperRef.current.contains(evt.relatedTarget)) setDropdownOpen(false);
        };

        wrapperRef.current!.addEventListener("keydown", closeDropdownOnEscape);
        wrapperRef.current!.addEventListener("focusout", closeDropdownOnUnfocus);
        
        return () => {
            wrapperRef.current!.removeEventListener("keydown", closeDropdownOnEscape);
            wrapperRef.current!.removeEventListener("focusout", closeDropdownOnUnfocus);
        };
    }, [dropdownOpen]);

    return (
        <div ref={wrapperRef} className="dropdown-button-wrapper">
            <div className={"dropdown-container " + (dropdownOpen ? "open" : "closed")}>
                {options.map((option, idx) =>
                    <IconButton
                        giveRef={idx === 0 ? firstOptionRef : undefined}
                        src={option.src}
                        text={option.text}
                        onClick={option.callback}
                        disabled={option.disabled}
                    />
                )}
            </div>

            <IconButton
                id={id}
                src={src}
                text={text}
                onClick={toggleDropdown}
                giveRef={mainButtonRef}
            />
        </div>
    );
}