"use client";

import React from "react";
import {
    Dialog,
    DialogHeadline,
    DialogHeader,
    DialogBody,
    DialogClose,
    DialogAction,
} from "../../components/DialogFullscreen";
import BudgetAddForm from "../budget-add-form/BudgetAddForm";
import FabPrimary from "../../components/FabPrimary";
import IconPlusLg from "../../icons/PlusLg";
import style from "./BudgetAddFormMobile.module.scss";

export default function AddFormDialogFullscreen() {
    const formId = React.useId();
    const [open, setOpen] = React.useState(false);
    const fabRef = React.useRef(null);

    const handleResize = React.useCallback(() => {
        if (fabRef.current instanceof HTMLDialogElement) {
            if (window.innerWidth < 600) {
                fabRef.current.show();
            } else {
                fabRef.current.close();
                setOpen(false); 
            }
        }
    }, []);

    React.useEffect(() => {
        handleResize()
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    return (
        <>
            <dialog ref={fabRef} className={style.fab}>
                <FabPrimary onClick={() => setOpen(true)}>
                    <IconPlusLg />
                </FabPrimary>
            </dialog>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeader>
                    <DialogClose></DialogClose>
                    <DialogHeadline>Tambah Budget</DialogHeadline>
                    <DialogAction form={formId}>Simpan</DialogAction>
                </DialogHeader>
                <DialogBody>
                    <BudgetAddForm id={formId} />
                </DialogBody>
            </Dialog>
        </>
    );
}