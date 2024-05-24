import { useEffect, useRef } from "react";
import "./styles/FancyInput.css";

interface Props {
    giveRef?: React.RefObject<any>,
    label: string,
    value: string,
    setValue: (newValue: string) => void,
    disabled?: boolean,
    searchKey?: string,
    useTextarea?: boolean,
    children?: React.ReactNode,
}

export default function FancyInput({
    giveRef,
    label,
    value,
    setValue,
    disabled,
    searchKey,
    useTextarea,
    children,
}: Props) {
    const localRef = useRef<any>(null);
    const ref = giveRef || localRef;

    useEffect(() => {
        if (!searchKey) return;

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

    const onChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (disabled) return;
        setValue(evt.target.value);
    };

    let className = "input-wrap";
    if (value) className += " has-content";

    return (
        <div className={className}>
            <p className="input-label">
                <span className="main-label">{label}</span>
                {searchKey && <>{" "}<span className="key-hint">(ctrl + {searchKey})</span></>}
            </p>

            {
                useTextarea ?
                    <textarea
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                    />
                    :
                    <input
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                    />
            }

            {children}
        </div>
    );
}