"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeadline,
    DialogParagraph,
    DialogBody,
} from "../../components/Dialog";
import ButtonFilled from "../../components/ButtonFIlled";
import Form from "../BudgetAddForm";
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
            <ButtonFilled onClick={handleOpen}>
                Tambah
            </ButtonFilled>
            <DialogContent className={style.dialog}>
                <DialogHeadline>{heading}</DialogHeadline>
                <DialogParagraph>Test</DialogParagraph>
            </DialogContent>
        </Dialog>
    );
}