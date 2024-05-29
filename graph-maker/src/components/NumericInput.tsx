import { useEffect, useRef } from "react";
import FancyInput, { FancyInputProps } from "./FancyInput";
import "./styles/NumericInput.css";

interface Props extends Omit<FancyInputProps, "value" | "setValue"> {
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    minValue: number,
    maxValue: number,
    showSteppers?: boolean,
}

export default function NumericInput({
    giveRef,
    value,
    setValue,
    minValue,
    maxValue,
    showSteppers,
    children,
    ...props
}: Props) {
    const localRef = useRef<any>(null);
    const ref = giveRef || localRef;

    const incrementValue = () => setValue(value => Math.min(value + 1, maxValue + 1));
    const decrementValue = () => setValue(value => Math.max(minValue, value - 1));

    useEffect(() => {
        const arrowKeyListener = (evt: KeyboardEvent) => {
            if (evt.key === "ArrowUp") {
                incrementValue();
                evt.preventDefault();
            }
            if (evt.key === "ArrowDown") {
                decrementValue();
                evt.preventDefault();
            }
        };

        ref.current?.addEventListener("keydown", arrowKeyListener);
        return () => ref.current?.removeEventListener("keydown", arrowKeyListener);
    }, []);

    const onChange = (input: string) => {
        const newValue = parseInt(input.replace(/\D/g, ""));
        if (Number.isNaN(newValue)) setValue(0);
        else setValue(Math.max(minValue, Math.min(newValue, maxValue + 1)));
    };

    return (
        <FancyInput giveRef={ref} {...props} value={value.toString()} setValue={onChange}>
            {children}

            {
                showSteppers && <>
                    <button className="increment-button" onClick={incrementValue} tabIndex={-1}>/\</button>
                    <button className="decrement-button" onClick={decrementValue} tabIndex={-1}>\/</button>
                </>
            }
        </FancyInput>
    );
}