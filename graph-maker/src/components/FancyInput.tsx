import { useEffect, useRef } from "react";
import "./styles/FancyInput.css";

interface Props {
    giveRef?: React.RefObject<HTMLInputElement>,
    label: string,
    value: string,
    setValue: (newValue: string) => void,
    disabled?: boolean,
    searchKey: string,
}

export default function FancyInput({
    giveRef,
    label,
    value,
    setValue,
    disabled,
    searchKey,
}: Props) {
    const localRef = useRef<HTMLInputElement>(null);
    const ref = giveRef || localRef;

    useEffect(() => {
        const jumpListener = (evt: KeyboardEvent) => {
            if (evt.ctrlKey && evt.key === searchKey) {
                ref.current?.focus();
            }
        };
        addEventListener("keydown", jumpListener);

        return () => {
            removeEventListener("keydown", jumpListener);
        };
    }, []);

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        setValue(evt.target.value);
    };

    let className = "input-wrap";
    if (value) className += " has-content";

    return (
        <div className={className}>
            <p className="input-label">
                <span className="main-label">{label}</span> <span className="key-hint">(ctrl + {searchKey})</span>
            </p>
            <input
                ref={ref}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    );
}