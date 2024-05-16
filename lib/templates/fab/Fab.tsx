import React from "react";
import FabPrimary from "../../components/FabPrimary";
import { useTemplateContext } from "../Template";
import style from "./Fab.module.scss";
import clsx from "clsx";

interface FabProps { 
    onShow?: () => void;
    onClose?: () => void;
}

const Fab = React.forwardRef<
    HTMLButtonElement,
    FabProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(function ({ onShow, onClose, className, ...props }, ref) {
    const { screen } = useTemplateContext();
    const dialogRef = React.useRef(null);

    React.useEffect(() => {
        if (dialogRef.current instanceof HTMLDialogElement) {
            if (screen === "compact") {
                dialogRef.current.show()
                if (onShow) onShow()
            } else {
                dialogRef.current.close()
                if (onClose) onClose()
            }
        }
    }, [screen]);

    return (
        <dialog ref={dialogRef} className={style.dialog}>
            <FabPrimary {...props} ref={ref} className={clsx(style.fab, className)} />
        </dialog>
    );
});

export default Fab;