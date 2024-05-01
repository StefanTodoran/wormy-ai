import { useEffect, useRef } from "react";
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
    const localRef = useRef<HTMLInputElement>(null);
    const ref = giveRef || localRef;

    const validCandidates = candidates.filter(candidate => {
        const invariantCandidate = candidate.toLowerCase();
        const invariantValue = value.toLowerCase();
        return invariantCandidate.startsWith(invariantValue) && invariantCandidate !== invariantValue;
    });
    const autoComplete = useRef<string>("");
    autoComplete.current = validCandidates[0];

    useEffect(() => {
        const autoCompleteListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Enter") return;
            if (!autoComplete.current) return;
            
            console.log(evt.key, autoComplete.current);
            setValue(autoComplete.current);
            evt.preventDefault();
        };

        ref.current?.addEventListener("keydown", autoCompleteListener);
        return () => ref.current?.removeEventListener("keydown", autoCompleteListener);
    }, [setValue]);

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
                value && autoComplete.current &&
                <div className="auto-complete">
                    {validCandidates.map((candidate, idx) => {
                        const alreadyWritten = candidate.slice(0, value.length);
                        const toComplete = candidate.slice(value.length);

                        return <div key={idx}>
                            <span className="already-written">{alreadyWritten!}</span>
                            <span className="to-complete">{toComplete!}</span>
                        </div>;
                    })}
                </div>
            }
        </>
    );
}