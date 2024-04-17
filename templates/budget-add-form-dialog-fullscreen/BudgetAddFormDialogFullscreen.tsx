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
import ButtonFilled from "../../components/ButtonFIlled";

export default function AddFormDialogFullscreen() {
    const formId = React.useId();
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <ButtonFilled onClick={() => setOpen(true)}>Tambah</ButtonFilled>
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