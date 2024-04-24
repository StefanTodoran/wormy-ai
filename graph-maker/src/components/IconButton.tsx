import "./styles/IconButton.css";

interface Props {
    giveRef?: React.RefObject<HTMLButtonElement>,
    src: string,
    text: string,
    onClick: () => void,
}

export default function IconButton({
    giveRef,
    src,
    text,
    onClick,
}: Props) {
    return (
        <button ref={giveRef} className="icon-button" onClick={onClick}>
            <img src={src}/>
            {text}
        </button>
    );
}