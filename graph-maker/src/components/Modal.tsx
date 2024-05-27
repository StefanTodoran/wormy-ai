import { useEffect, useRef } from "react";
import "./styles/Modal.css";

interface Props {
    open: boolean,
    setOpen: (isOpen: boolean) => void,
    children: React.ReactNode,
}

export default function Modal({
    open,
    setOpen,
    children,
}: Props) {
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            modalRef.current?.showModal();
            const firstInput = modalRef.current?.querySelector("input");
            firstInput?.focus();
        }
        else modalRef.current?.close();
    }, [open]);

    useEffect(() => {
        const exitModelListener = (evt: KeyboardEvent) => {
            if (evt.key !== "Escape") return;
            setOpen(false);
        };

        addEventListener("keydown", exitModelListener);
        return () => removeEventListener("keydown", exitModelListener);
    }, []);

    return (
        <dialog className={open ? "open" : "closed"} ref={modalRef}>
            {open && children}
        </dialog>
    );
}