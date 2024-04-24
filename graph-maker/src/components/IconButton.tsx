import "./styles/IconButton.css";

interface Props {
    src: string,
    text: string,
    onClick: () => void,
}

export default function IconButton({
    src,
    text,
    onClick,
}: Props) {
    return (
        <button className="icon-button" onClick={onClick}>
            <img src={src}/>
            {text}
        </button>
    );
}