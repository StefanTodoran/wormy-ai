import "./styles/IconButton.css";

interface Props {
    id?: string,
    giveRef?: React.RefObject<HTMLButtonElement>,
    src?: string,
    text: string,
    onClick: () => void,
    disabled?: boolean,
    customClass?: string,
}

export default function IconButton({
    id,
    giveRef,
    src,
    text,
    onClick,
    disabled,
    customClass,
}: Props) {
    let className = "icon-button";
    if (customClass) className += " " + customClass;

    return (
        <button id={id} ref={giveRef} className={className} onClick={onClick} disabled={disabled}>
            {src && <img src={src}/>}
            {text}
        </button>
    );
}