import { useEffect, useRef } from "react";
import { isDarkMode } from "../utils/misc";
import "./styles/PlayPauseControls.css";

interface Props {
    // playing: boolean,
    // setPlaying: (playing: boolean) => void,
    scrubberPosition: number,
    setScrubberPosition: React.Dispatch<React.SetStateAction<number>>,
    maxTimestamp: number,
}

export default function PlayPauseControls({
    // playing,
    // setPlaying,
    scrubberPosition,
    setScrubberPosition,
    maxTimestamp,
}: Props) {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const fillColor = isDarkMode() ? "white" : "black";

    const skipBackward = () => {
        setScrubberPosition(position => Math.max(position - 1, 0));
        // setPlaying(false);
    };
    const skipForward = () => {
        setScrubberPosition(position => Math.min(position + 1, maxTimestamp));
        // setPlaying(false);
    };

    useEffect(() => {
        const handleMouseInteract = (evt: MouseEvent) => {
            const bounds = progressBarRef.current!.getBoundingClientRect();
            const percentage = (evt.clientX - bounds.left) / bounds.width;
            if (evt.buttons === 1) setScrubberPosition(Math.round(percentage * maxTimestamp));
        }

        const handleKeypress = (evt: KeyboardEvent) => {
            if (evt.key === "ArrowLeft") skipBackward();
            if (evt.key === "ArrowRight") skipForward();
        };

        progressBarRef.current?.addEventListener("mousemove", handleMouseInteract);
        progressBarRef.current?.addEventListener("mousedown", handleMouseInteract);
        progressBarRef.current?.addEventListener("mouseup", handleMouseInteract);
        addEventListener("keydown", handleKeypress);

        return () => {
            progressBarRef.current?.removeEventListener("mousemove", handleMouseInteract);
            progressBarRef.current?.removeEventListener("mousedown", handleMouseInteract);
            progressBarRef.current?.removeEventListener("mouseup", handleMouseInteract);
            removeEventListener("keydown", handleKeypress);
        }
    }, []);

    return (
        <div className="controls-container">
            <SkipIcon
                fillColor={fillColor}
                onClick={skipBackward}
                inverted
            />
            {/* {
                playing ?
                <PauseIcon fillColor={fillColor} onClick={() => setPlaying(false)} /> :
                <PlayIcon fillColor={fillColor} onClick={() => setPlaying(true)} />
            } */}

            <div
                className="progress-bar-container"
                style={{ "--progress": scrubberPosition / maxTimestamp } as React.CSSProperties}
                ref={progressBarRef}
            >
                <div className="progress-bar" />
                <div className="scrubber" style={{ "--timestep": '"' + scrubberPosition + '"' } as React.CSSProperties}/>
            </div>

            <SkipIcon
                fillColor={fillColor}
                onClick={skipForward}
            />
        </div>
    );
}

interface ControlsButtonProps {
    fillColor: string,
    onClick: () => void,
}

// function PlayIcon({ fillColor, onClick }: ControlsButtonProps) {
//     return <svg className="controls-button play-icon-button" onClick={onClick} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M38.7375 16.9132C43.0894 19.5948 45.265 20.9355 46.0113 22.6524C46.6629 24.1514 46.6629 25.8486 46.0113 27.3479C45.265 29.0644 43.0894 30.4052 38.7375 33.087L18.2984 45.6823C13.4685 48.6585 11.0536 50.1468 9.06068 49.9886C7.32356 49.8509 5.73119 48.981 4.69209 47.6015C3.5 46.019 3.5 43.2111 3.5 37.5954V12.4048C3.5 6.78908 3.5 3.98125 4.69209 2.39871C5.73119 1.01927 7.32356 0.149096 9.06068 0.011384C11.0536 -0.146563 13.4685 1.3416 18.2984 4.31792L38.7375 16.9132Z" fill={fillColor} />
//     </svg>;
// }

// function PauseIcon({ fillColor, onClick }: ControlsButtonProps) {
//     return <svg className="controls-button pause-icon-button" onClick={onClick} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M0 10C0 5.28595 -2.29249e-07 2.92892 1.47856 1.46447C2.95709 -1.14624e-07 5.33678 0 10.0962 0C14.8555 0 17.2352 -1.14624e-07 18.7138 1.46447C20.1923 2.92892 20.1923 5.28595 20.1923 10V40C20.1923 44.714 20.1923 47.071 18.7138 48.5355C17.2352 50 14.8555 50 10.0962 50C5.33678 50 2.95709 50 1.47856 48.5355C-2.29249e-07 47.071 0 44.714 0 40V10Z" fill={fillColor} />
//         <path d="M29.8077 10C29.8077 5.28595 29.8077 2.92892 31.2863 1.46447C32.7649 -1.14624e-07 35.1445 0 39.9038 0C44.6632 0 47.0428 -1.14624e-07 48.5214 1.46447C50 2.92892 50 5.28595 50 10V40C50 44.714 50 47.071 48.5214 48.5355C47.0428 50 44.6632 50 39.9038 50C35.1445 50 32.7649 50 31.2863 48.5355C29.8077 47.071 29.8077 44.714 29.8077 40V10Z" fill={fillColor} />
//     </svg>;
// }

interface SkipButtonProps extends ControlsButtonProps {
    inverted?: boolean,
}

function SkipIcon({ fillColor, onClick, inverted }: SkipButtonProps) {
    let className = "controls-button skip-icon-button";
    if (inverted) className += " inverted";

    return <svg className={className} onClick={onClick} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M33.6622 13.6062C33.6622 10.0255 33.6622 8.2351 34.7853 7.12273C35.9085 6.01033 37.716 6.01033 41.3311 6.01033C44.9463 6.01033 46.7538 6.01033 47.8769 7.12273C49 8.2351 49 10.0255 49 13.6062V36.3938C49 39.9745 49 41.7648 47.8769 42.8772C46.7538 43.9897 44.9463 43.9897 41.3311 43.9897C37.716 43.9897 35.9085 43.9897 34.7853 42.8772C33.6622 41.7648 33.6622 39.9745 33.6622 36.3938V13.6062Z" fill={fillColor} />
        <path d="M27.7659 18.8573C31.0715 20.8942 32.7241 21.9127 33.291 23.2168C33.786 24.3554 33.786 25.6446 33.291 26.7834C32.7241 28.0873 31.0715 29.1057 27.7659 31.1428L12.2407 40.71C8.57195 42.9707 6.73758 44.1012 5.22381 43.981C3.90432 43.8764 2.69478 43.2156 1.9055 42.1678C1 40.9658 1 38.8329 1 34.5673V15.4328C1 11.1672 1 9.03444 1.9055 7.83236C2.69478 6.78455 3.90432 6.12358 5.22381 6.01898C6.73758 5.899 8.57195 7.02939 12.2407 9.29016L27.7659 18.8573Z" fill={fillColor} />
    </svg>;
}