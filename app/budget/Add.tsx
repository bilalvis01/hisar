"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeading,
    DialogDescription,
} from "../../components/Dialog";
import ButtonFilled from "../../components/ButtonFIlled";
import Form from "./AddForm";
import style from "./add.module.scss";
import Close from "../../icons/Close";

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
            <ButtonFilled>
                Tambah
            </ButtonFilled>
            <DialogContent overlay={style.overlay} className={style.dialog}>
                <div className={style.card}>
                    <header>
                        <DialogHeading>{heading}</DialogHeading>
                        <ButtonFilled onClick={handleClose}><Close /></ButtonFilled>
                    </header>
                    <DialogDescription>
                        <Form />
                    </DialogDescription>
                </div>
            </DialogContent>
        </Dialog>
    );
}