"use client";

import React from "react";
import {
    Dialog,
    DialogHeadline,
    DialogBody,
    DialogFooter,
} from "../components/dialog/Dialog";
import ButtonFilled from "../components/ButtonFIlled";
import ButtonText from "../components/ButtonText";
import BudgetAddForm from "./budget-add-form/BudgetAddForm";

export default function BudgetAddFormDesktop() {
    const id = React.useId();
    const [open, setOpen] = React.useState(false);

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleResize = React.useCallback(() => {
        if (window.innerWidth < 600) setOpen(false);
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    return (
        <>
            <ButtonFilled onClick={handleOpen}>
                Tambah
            </ButtonFilled>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeadline>Tambah Budget</DialogHeadline>
                <DialogBody>
                    <BudgetAddForm id={id} />
                </DialogBody>
                <DialogFooter>
                    <ButtonText onClick={() => setOpen(false)}>Batal</ButtonText>
                    <ButtonText type="submit" form={id}>Simpan</ButtonText>
                    </DialogFooter>
            </Dialog>
        </>
    );
}