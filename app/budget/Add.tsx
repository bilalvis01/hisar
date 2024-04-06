"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeading,
    DialogDescription,
} from "../../components/Dialog";
import ButtonSolid from "../../components/ButtonSolid";
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
            <ButtonSolid>
                Tambah
            </ButtonSolid>
            <DialogContent overlay={style.overlay} className={style.dialog}>
                <div className={style.card}>
                    <header>
                        <DialogHeading>{heading}</DialogHeading>
                        <ButtonSolid onClick={handleClose}><Close /></ButtonSolid>
                    </header>
                    <DialogDescription>
                        <Form />
                    </DialogDescription>
                </div>
            </DialogContent>
        </Dialog>
    );
}