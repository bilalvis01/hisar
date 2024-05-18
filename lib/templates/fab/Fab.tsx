import React from "react";
import FabPrimary from "../../components/FabPrimary";
import { useTemplateContext } from "../Template";
import style from "./Fab.module.scss";
import clsx from "clsx";

interface FabProps { 
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onShow?: () => void;
    onClose?: () => void;
}

const Fab = React.forwardRef<
    HTMLButtonElement,
    FabProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(function ({ 
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onShow, 
    onClose, 
    className, 
    ...props 
}, ref) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const { windowSize } = useTemplateContext();
    const dialogRef = React.useRef(null);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    React.useEffect(() => {
        if (windowSize === "compact") {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [windowSize]);

    React.useEffect(() => {
        if (dialogRef.current instanceof HTMLDialogElement) {
            if (open) {
                dialogRef.current.show()
                if (onShow) onShow()
            } else {
                dialogRef.current.close()
                if (onClose) onClose()
            }
        }
    }, [open]);

    return (
        <dialog ref={dialogRef} className={style.dialog}>
            <FabPrimary {...props} ref={ref} className={clsx(style.fab, className)} />
        </dialog>
    );
});

export default Fab;