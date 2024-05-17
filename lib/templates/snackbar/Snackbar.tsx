import React from "react";
import { 
    Snackbar as SnackbarBase, 
    SupportingText as SnackbarText, 
    IconAction as SnackbarIconAction,
} from "../../components/Snackbar";
import useMergeRefs from "../../hooks/useMergeRefs";
import IconX from "../../icons/X";
import style from "./Snackbar.module.scss";

const Snackbar = React.forwardRef<
    HTMLDialogElement,
    { open: boolean; onClose: () => void } & React.HTMLProps<HTMLDialogElement>
>(function ({ children, open, onClose, ...props }, propRef) {
    const dialogRef = React.useRef(null);
    const ref = useMergeRefs([dialogRef, propRef]);

    const handleClose = () => {
        if (onClose) onClose();
        if (dialogRef.current instanceof HTMLDialogElement) dialogRef.current.close();
    };

    React.useEffect(() => {
        let timeoutId;

        if (open) {
            if (dialogRef.current instanceof HTMLDialogElement) dialogRef.current.show();

            timeoutId =  setTimeout(() => {
                if (onClose) onClose();
                if (dialogRef.current instanceof HTMLDialogElement) dialogRef.current.close();
            }, 5000);
        }

        () => clearTimeout(timeoutId);
    }, [open]);

    return (
        <dialog {...props} className={style.dialog} ref={ref}>
            <SnackbarBase className={style.snackbar}>
                <SnackbarText>{children}</SnackbarText>
                <SnackbarIconAction onClick={handleClose}>
                    <IconX />
                </SnackbarIconAction>
            </SnackbarBase>
        </dialog>
    );
});

export default Snackbar;