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
import TextField from "../../components/TextField";

interface AddProps {
    heading: string;
}

export default function Add({ 
    heading
}) {
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
                    <TextField label="Budget" />
                </DialogBody>
                <DialogFooter>
                    <ButtonText onClick={() => setOpen(false)}>Batal</ButtonText>
                    <ButtonText>Simpan</ButtonText>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}