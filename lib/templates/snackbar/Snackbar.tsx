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
    HTMLDivElement,
    { 
        open: boolean; 
        onOpenChange: (open: boolean) => void;  
        onClose?: () => void;
    } & React.HTMLProps<HTMLDivElement>
>(function ({ children, open, onOpenChange: setOpen, onClose, ...props }, propRef) {
    const handleClose = () => {
        if (onClose) onClose();
        setOpen(false);
    };

    React.useEffect(() => {
        let timeoutId;

        if (open) {
            timeoutId =  setTimeout(() => {
                handleClose();
            }, 5000);
        }

        () => clearTimeout(timeoutId);
    }, [open]);

    if (!open) {
        return;
    }

    return (
        <SnackbarBase {...props} className={style.snackbar}>
            <SnackbarText>{children}</SnackbarText>
            <SnackbarIconAction onClick={handleClose}>
                <IconX />
            </SnackbarIconAction>
        </SnackbarBase>
    );
});

export default Snackbar;