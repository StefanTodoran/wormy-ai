import { useEffect, useRef, useState } from "react";
import "./styles/AutocompleteInput.css";

interface Props {
    giveRef?: React.RefObject<HTMLInputElement>,
    value: string,
    setValue: (newValue: string) => void,
    candidates: string[],
    disabled: boolean,
}

export default function AutocompleteInput({
    giveRef,
    value,
    setValue,
    candidates,
    disabled,
}: Props) {
    const [selected, setSelected] = useState(0);
    const localRef = useRef<HTMLInputElement>(null);
    const ref = giveRef || localRef;

    const validCandidates = candidates.filter(candidate => {
        const invariantCandidate = candidate.toLowerCase();
        const invariantValue = value.toLowerCase();
        return invariantCandidate.startsWith(invariantValue) && invariantCandidate !== invariantValue;
    });
    const autoCompleteCandidates = useRef<string[]>([]);
    autoCompleteCandidates.current = validCandidates;

    useEffect(() => {
        const autoCompleteListener = (evt: KeyboardEvent) => {
            if (evt.key === "Enter") {
                if (autoCompleteCandidates.current.length < 1) return;
                setValue(autoCompleteCandidates.current[selected]);
                evt.preventDefault();
            }
            if (evt.key === "ArrowUp") {
                setSelected(Math.max(0, selected - 1));
                evt.preventDefault();
            }
            if (evt.key === "ArrowDown") {
                setSelected(Math.min(autoCompleteCandidates.current.length, selected + 1));
                evt.preventDefault();
            }
        };

        ref.current?.addEventListener("keydown", autoCompleteListener);
        return () => ref.current?.removeEventListener("keydown", autoCompleteListener);
    }, [selected, setValue]);

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        setValue(evt.target.value);
    };

    return (
        <>
            <input
                ref={giveRef}
                value={value}
                onChange={onChange}
                disabled={disabled} />
            {
                value && autoCompleteCandidates.current.length > 0 &&
                <div className="auto-complete">
                    {validCandidates.map((candidate, idx) => {
                        const alreadyWritten = candidate.slice(0, value.length);
                        const toComplete = candidate.slice(value.length);

                        return <div key={idx} className={idx === selected ? "selected" : ""}>
                            <span className="already-written">{alreadyWritten!}</span>
                            <span className="to-complete">{toComplete!}</span>
                        </div>;
                    })}
                    <span className="hint">(Enter to autocomplete)</span>
                </div>
            }
        </>
    );
}