"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeadline,
    DialogBody,
    DialogFooter,
} from "../../components/dialog/Dialog";
import ButtonFilled from "../../components/ButtonFIlled";
import ButtonText from "../../components/ButtonText";
import style from "./BudgetAdd.module.scss";
import BudgetAddForm from "../budget-add-form/BudgetAddForm";

interface AddProps {
    heading: string;
}

export default function Add({ 
    heading
}) {
    const id = React.useId();
    const [open, setOpen] = React.useState(false);

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <ButtonFilled onClick={handleOpen}>
                Tambah
            </ButtonFilled>
            <DialogContent className={style.dialog}>
                <DialogHeadline>{heading}</DialogHeadline>
                <DialogBody>
                    <BudgetAddForm id={id} />
                </DialogBody>
                <DialogFooter>
                    <ButtonText onClick={() => setOpen(false)}>Batal</ButtonText>
                    <ButtonText type="submit" form={id}>Simpan</ButtonText>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}