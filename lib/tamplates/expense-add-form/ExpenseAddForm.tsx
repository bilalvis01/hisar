"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm, 
} from "formik";
import * as Yup from "yup";
import ButtonFilled from "../../components/ButtonFIlled";
import TextField from "../TextField";
import style from "./ExpenseAddForm.module.scss";
import {
    Dialog as DialogFullscreen,
    DialogHeadline as DialogFullscreenHeadline,
    DialogHeader as DialogFullscreenHeader,
    DialogBody as DialogFullscreenBody,
    DialogClose as DialogFullscreenClose,
    DialogAction as DialogFullscreenAction,
} from "../../components/DialogFullscreen";
import {
    Dialog,
    DialogHeadline,
    DialogBody,
    DialogFooter,
} from "../../components/Dialog";
import FabPrimary from "../../components/FabPrimary";
import IconPlusLg from "../../icons/PlusLg";
import ButtonText from "../../components/ButtonText"

type Open = "none" | "desktop" | "mobile";

interface FormProps {
    id: string;
}

function Form({ id }: FormProps) {
    return (
        <Formik
            initialValues={{
                description: "",
                budget: "",
            }}
            validationSchema={Yup.object({
                description: Yup.string().required("Wajib diisi"),
                budget: Yup.number().typeError("Wajib masukan angka").required("Wajib diisi"),
            })}
            onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                }, 2000);
            }}
        >
            {() => (
                <FormikForm id={id}>
                    <TextField className={style.field} type="text" label="Deskripsi" name="description" counter={50}/> 
                    <TextField className={style.field} type="text" label="Budget" name="budget" />
                </FormikForm>
            )}
        </Formik>
    )
}

function FormDialogMobile({
    open,
    onOpenChange: setOpen,
}: {
    open: Open,
    onOpenChange: (open: boolean) => void,
}) {
    const formId = React.useId();
    const fabRef = React.useRef(null);

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleResize = React.useCallback(() => {
        if (fabRef.current instanceof HTMLDialogElement) {
            if (window.innerWidth < 600) {
                fabRef.current.show();
            } else {
                fabRef.current.close();
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
                <FabPrimary onClick={handleOpen}>
                    <IconPlusLg />
                </FabPrimary>
            </dialog>
            <DialogFullscreen open={open === "mobile"} onOpenChange={setOpen}>
                <DialogFullscreenHeader>
                    <DialogFullscreenClose></DialogFullscreenClose>
                    <DialogFullscreenHeadline>Tambah Budget</DialogFullscreenHeadline>
                    <DialogFullscreenAction form={formId}>Simpan</DialogFullscreenAction>
                </DialogFullscreenHeader>
                <DialogFullscreenBody>
                    <Form id={formId} />
                </DialogFullscreenBody>
            </DialogFullscreen>
        </>
    );
}

function FormDialogDesktop({
    open,
    onOpenChange: setOpen,
}: {
    open: Open,
    onOpenChange: (open: boolean) => void,
}) {
    const id = React.useId();

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <>
            <ButtonFilled onClick={handleOpen}>
                Tambah
            </ButtonFilled>
            <Dialog open={open === "desktop"} onOpenChange={setOpen}>
                <DialogHeadline>Tambah Budget</DialogHeadline>
                <DialogBody>
                    <Form id={id} />
                </DialogBody>
                <DialogFooter>
                    <ButtonText onClick={handleClose}>Batal</ButtonText>
                    <ButtonText type="submit" form={id}>Simpan</ButtonText>
                    </DialogFooter>
            </Dialog>
        </>
    );
}

export default function BudgetAddForm() {
    const [open, setOpen] = React.useState<Open>("none");

    const handleOpen = React.useCallback((open) => {
        if (open) {
            if (window.innerWidth < 600) setOpen("mobile");
            else setOpen("desktop");
        } else {
            setOpen("none");
        }
    }, []);

    const handleResize = React.useCallback(() => {
        if (open !== "none") {
            if (window.innerWidth < 600) setOpen("mobile");
            else setOpen("desktop");
        }
    }, [open]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    return (
        <div>
            <FormDialogDesktop open={open} onOpenChange={handleOpen} />
            <FormDialogMobile open={open} onOpenChange={handleOpen} />
        </div>
    );
}