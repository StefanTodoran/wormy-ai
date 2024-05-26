import { useEffect, useRef, useState } from "react";
import FancyInput from "./FancyInput";
import "./styles/AutocompleteInput.css";

interface Props {
    label: string,
    giveRef?: React.RefObject<HTMLInputElement>,
    value: string,
    setValue: (newValue: string) => void,
    candidates: string[],
    disabled?: boolean,
    truncateCandidates?: number,
    hideCandidatesWhenEmpty?: boolean,
}

export default function AutocompleteInput({
    label,
    giveRef,
    value,
    setValue,
    candidates,
    disabled,
    truncateCandidates,
    hideCandidatesWhenEmpty,
}: Props) {
    const [selected, setSelected] = useState(0);
    const localRef = useRef<HTMLInputElement>(null);
    const ref = giveRef || localRef;

    const [sliceStart, setSliceStart] = useState(0);
    const candidatesShown = truncateCandidates || 10;
    const sliceEnd = Math.min(candidates.length, sliceStart + candidatesShown);
    
    let validCandidates = candidates.filter(candidate => {
        const invariantCandidate = candidate.toLowerCase();
        const invariantValue = value.toLowerCase();
        return invariantCandidate.startsWith(invariantValue) && invariantCandidate !== invariantValue;
    });
    const hiddenOptions = sliceEnd < validCandidates.length;
    validCandidates = validCandidates.slice(sliceStart, sliceEnd);

    const autoCompleteCandidates = useRef<string[]>([]);
    autoCompleteCandidates.current = validCandidates;

    useEffect(() => {
        setSelected(Math.max(0, Math.min(autoCompleteCandidates.current.length - 1, selected)));
        setSliceStart(0);
    }, [value]);

    useEffect(() => {
        const autoCompleteListener = (evt: KeyboardEvent) => {
            if (evt.key === "Enter") {
                if (autoCompleteCandidates.current.length < 1) return;
                setValue(autoCompleteCandidates.current[selected]);
                evt.preventDefault();
            }
            if (evt.key === "ArrowUp") {
                console.log(selected);
                if (selected === 0 && sliceStart > 0) setSliceStart(sliceStart - 1);
                setSelected(Math.max(0, selected - 1));
                evt.preventDefault();
            }
            if (evt.key === "ArrowDown") {
                if (selected + sliceStart >= sliceEnd - 1 && sliceStart < candidates.length - candidatesShown) setSliceStart(sliceStart + 1);
                setSelected(Math.min(autoCompleteCandidates.current.length - 1, selected + 1));
                evt.preventDefault();
            }
        };

        ref.current?.addEventListener("keydown", autoCompleteListener);
        return () => ref.current?.removeEventListener("keydown", autoCompleteListener);
    }, [selected, setValue, sliceStart, setSliceStart]);

    return (
        <>
            <FancyInput
                label={label}
                giveRef={ref}
                value={value}
                setValue={setValue}
                disabled={disabled}
            >
                {
                    (!hideCandidatesWhenEmpty || value) && autoCompleteCandidates.current.length > 0 &&
                    <div className="auto-complete">
                        {sliceStart !== 0 && <div className="hidden-options-indicator">...</div>}
                        
                        {validCandidates.map((candidate, idx) => {
                            const alreadyWritten = candidate.slice(0, value.length);
                            const toComplete = candidate.slice(value.length);

                            return <div key={idx} className={idx === selected ? "selected" : ""}>
                                <span className="already-written">{alreadyWritten!}</span>
                                <span className="to-complete">{toComplete!}</span>
                            </div>;
                        })}

                        {hiddenOptions && <div className="hidden-options-indicator">...</div>}

                        <span className="hint">(Enter to autocomplete)</span>
                    </div>
                }
            </FancyInput>
        </>
    );
}