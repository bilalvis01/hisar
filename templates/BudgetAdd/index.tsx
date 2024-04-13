"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeadline,
    DialogParagraph,
    DialogFooter,
} from "../../components/Dialog";
import ButtonFilled from "../../components/ButtonFIlled";
import ButtonText from "../../components/ButtonText";
import style from "./add.module.scss";

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
                <DialogParagraph>Form Tambah</DialogParagraph>
                <DialogFooter>
                    <ButtonText onClick={() => setOpen(false)}>Batal</ButtonText>
                    <ButtonText>Simpan</ButtonText>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}