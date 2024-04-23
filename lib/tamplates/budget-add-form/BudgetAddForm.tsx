"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm, 
    FormikBag,
} from "formik";
import * as Yup from "yup";
import ButtonFilled from "../../components/ButtonFIlled";
import TextField from "../TextField";
import style from "./BudgetAddForm.module.scss";
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
import ButtonText from "../../components/ButtonText";
import { gql } from "../../graphql-tag";
import { CreateBudgetInput } from "../../graphql-tag/graphql";
import { useMutation } from "@apollo/client";

interface FormProps {
    id: string;
}

function Form({ id }: FormProps) {
    return (
        <FormikForm id={id}>
            <TextField className={style.field} type="text" label="Nama" name="name" counter={50}/> 
            <TextField className={style.field} type="number" label="Budget" name="budget" />
        </FormikForm>
    )
}

function FormDialogMobile({
    open,
    onOpenChange: setOpen,
    isSubmitting,
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    isSubmitting: boolean,
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
            <DialogFullscreen open={open} onOpenChange={setOpen}>
                <DialogFullscreenHeader>
                    <DialogFullscreenClose></DialogFullscreenClose>
                    <DialogFullscreenHeadline>Tambah Budget</DialogFullscreenHeadline>
                    <DialogFullscreenAction form={formId} disabled={isSubmitting}>Simpan</DialogFullscreenAction>
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
    isSubmitting,
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    isSubmitting: boolean,
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeadline>Tambah Budget</DialogHeadline>
                <DialogBody>
                    <Form id={id} />
                </DialogBody>
                <DialogFooter>
                    <ButtonText onClick={handleClose}>Batal</ButtonText>
                    <ButtonText type="submit" form={id} disabled={isSubmitting}>Simpan</ButtonText>
                    </DialogFooter>
            </Dialog>
        </>
    );
}

const CREATE_BUDGET = gql(/* GraphQL */`
    mutation CreateBudget($input: CreateBudgetInput!) {
        createBudget(input: $input) {
            code
            success
            message
            budget {
                id
                name
                budget
                expense
                balance
                createdAt
                updatedAt
            }
        }
    }
`);

export default function BudgetAddForm() {
    const [dialog, setDialog] = React.useState<"none" | "desktop" | "mobile">("none");

    const [createBudget, { loading, data }] = useMutation(CREATE_BUDGET);

    console.log(data);

    const handleOpen = React.useCallback((open) => {
        if (open) {
            if (window.innerWidth < 600) setDialog("mobile");
            else setDialog("desktop");
        } else {
            setDialog("none");
        }
    }, []);

    const handleResize = React.useCallback(() => {
        if (dialog !== "none") {
            if (window.innerWidth < 600) setDialog("mobile");
            else setDialog("desktop");
        }
    }, [dialog]);

    const handleSubmit = React.useCallback((value) => {
        createBudget({
            variables: {
                input: value
            }
        })
    }, [createBudget]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    return (
        <Formik<CreateBudgetInput>
            initialValues={{
                name: null,
                budget: null,
            }}
            validationSchema={Yup.object({
                name: Yup.string().required("Wajib diisi"),
                budget: Yup.number().typeError("Wajib masukan angka").required("Wajib diisi"),
            })}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
                <div>
                    <FormDialogDesktop isSubmitting={loading} open={dialog === "desktop"} onOpenChange={handleOpen} />
                    <FormDialogMobile isSubmitting={loading} open={dialog === "mobile"} onOpenChange={handleOpen} />
                </div>
            )}
        </Formik>
    );
}