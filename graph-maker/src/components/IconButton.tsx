import "./styles/IconButton.css";

interface Props {
    id?: string,
    giveRef?: React.RefObject<HTMLButtonElement>,
    src?: string,
    text: string,
    onClick: () => void,
    disabled?: boolean,
}

export default function IconButton({
    id,
    giveRef,
    src,
    text,
    onClick,
    disabled,
}: Props) {
    return (
        <button id={id} ref={giveRef} className="icon-button" onClick={onClick} disabled={disabled}>
            {src && <img src={src}/>}
            {text}
        </button>
    );
}