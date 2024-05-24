import { useEffect, useRef } from "react";
import "./styles/Modal.css";

interface Props {
    open: boolean,
    children: React.ReactNode,
}

export default function Modal({
    open,
    children,
}: Props) {
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) modalRef.current?.showModal();
        else modalRef.current?.close();
    }, [open]);

    return (
        <dialog className={open ? "open" : "closed"} ref={modalRef}>
            {children}
        </dialog>
    );
}