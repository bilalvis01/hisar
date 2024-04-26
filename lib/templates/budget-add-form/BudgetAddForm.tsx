"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm,
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
import type { CreateBudgetInput, CreateBudgetMutation, CreateBudgetMutationVariables, CreateBudgetPayload } from "../../graphql-tag/graphql";
import { useMutation } from "@apollo/client";
import type { MutationFunction } from "@apollo/client";
import { CREATE_BUDGET, GET_BUDGETS } from "../../graphql-documents";
import { Snackbar, SupportingText as SnackbarText, IconAction as SnackbarIconAction } from "../../components/Snackbar";
import IconClose from "../../icons/Close";
import ProgressCircular from "../../components/ProgressCircular";

interface FormDialogContext {
    values: CreateBudgetInput;
    setValues: React.Dispatch<React.SetStateAction<CreateBudgetInput>>;
    dialog: string;
    onOpenChange: (open: boolean) => void;
    createBudget: MutationFunction<CreateBudgetMutation, CreateBudgetMutationVariables>;
    loading: boolean;
    payload?: CreateBudgetPayload;
}

const FormDialogContext = React.createContext<FormDialogContext>(null);

const useFormDialogContext = () => {
    const context = React.useContext(FormDialogContext);

    if (context == null) {
        throw new Error("Form dialog components must be wrapped in <FormDialog />");
    }

    return context;
}

const useFormDialog = () => {
    const [dialog, setDialog] = React.useState<"none" | "desktop" | "mobile">("none");
    const initialValues = {
        name: null,
        budget: null,
    };
    const [values, setValues] = React.useState<CreateBudgetInput>(initialValues);
    const [createBudget, { data, loading }] = useMutation(CREATE_BUDGET, {
        refetchQueries: [
            GET_BUDGETS,
            "GetBudgets"
        ]
    });

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

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    React.useEffect(() => {
        if (dialog == "none") setValues(initialValues);
    }, [dialog]);

    return React.useMemo(() => ({
        values,
        setValues,
        dialog,
        onOpenChange: handleOpen,
        loading,
        payload: data?.createBudget,
        createBudget,
    }), [dialog, values, loading, data]);
};

interface FormProps {
    id: string;
    open: boolean;
}

function Form({ id, open }) {
    /* When a form dialog is going to close, at the same time the form will be unmounted.
    `preparingUnmount` give the form a time to save its values to values state */
    const [preparingUnmount, setPreparingUnmount] = React.useState(true);
    /* when another form dialog is going to close, than the dialog's form will save its values to values state.
    But at the same time the current dialog is opening, at this point the values state still had the old values.
    `preparingMount` give the another dialog's form a time to refresh the state with the new values.
    */
    const [preparingMount, setPreparingMount] = React.useState(true);

    const { values, setValues, createBudget } = useFormDialogContext();

    React.useEffect(() => {
        if (open) {
            setPreparingUnmount(true);
            setPreparingMount(false);
        } else {
            setPreparingUnmount(false);
            setPreparingMount(true);
        }
    }, [open]); 

    if ((!open && !preparingUnmount) || (open && preparingMount)) return null;

    return (
        <Formik
            initialValues={values}
            validationSchema={Yup.object({
                name: Yup.string().required("Wajib diisi"),
                budget: Yup.number().typeError("Wajib masukan angka").required("Wajib diisi"),
            })}
            onSubmit={async (input) => {
                await createBudget({
                    variables: { input }
                });
            }}
        >
            {({ values }) => {
                React.useEffect(() => {
                    if (!open) setValues(values);
                }, [open]); 

                return (
                    <>
                        <FormikForm id={id}>
                            <TextField className={style.field} type="text" label="Nama" name="name" counter={50}/> 
                            <TextField className={style.field} type="number" label="Budget" name="budget" />
                        </FormikForm>
                    </>
                );
            }}
        </Formik>
    )
}

function FormDialogMobile() {
    const formId = React.useId();
    const fabRef = React.useRef(null);
    const { dialog, onOpenChange: setOpen, loading, payload } = useFormDialogContext();
    const open = dialog === "mobile";

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleResize = React.useCallback(() => {
        if (fabRef.current instanceof HTMLDialogElement) {
            if (window.innerWidth < 600 && !open) {
                fabRef.current.show();
            } else {
                fabRef.current.close();
            }
        }
    }, [open]);

    React.useEffect(() => {
        handleResize()
    }, [handleResize]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    React.useEffect(() => {
        if (payload && payload.success) setOpen(false);
    }, [payload]);

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
                    <DialogFullscreenAction 
                        form={formId} 
                        disabled={loading}
                        progress={loading ? <ProgressCircular size="sm" /> : null}
                    >
                        Simpan
                    </DialogFullscreenAction>
                </DialogFullscreenHeader>
                <DialogFullscreenBody>
                    <Form id={formId} open={open} />
                </DialogFullscreenBody>
            </DialogFullscreen>
        </>
    );
}

function FormDialogDesktop() {
    const formId = React.useId();
    const { dialog, onOpenChange: setOpen, loading, payload } = useFormDialogContext();
    const open = dialog === "desktop";
            
    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    React.useEffect(() => {
        if (payload && payload.success) setOpen(false);
    }, [payload]);

    return (
        <>
            <ButtonFilled onClick={handleOpen}>
                Tambah
            </ButtonFilled>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeadline>Tambah Budget</DialogHeadline>
                <DialogBody className={style.dialogBody}>
                    <Form id={formId} open={open} />
                </DialogBody>
                <DialogFooter>
                    <ButtonText onClick={handleClose}>Batal</ButtonText>
                    <ButtonText 
                        type="submit" 
                        form={formId} 
                        disabled={loading} 
                        progress={loading ? <ProgressCircular size="sm" /> : null}
                    >
                        Simpan
                    </ButtonText>
                </DialogFooter>
            </Dialog>
            <Info open={payload && payload.success}>{payload && payload.message}</Info>
        </>
    );
}

export default function BudgetAddForm() {
    const context = useFormDialog();

    return (
        <FormDialogContext.Provider value={context}>
            <div>
                <FormDialogDesktop />
                <FormDialogMobile />
            </div>
        </FormDialogContext.Provider>
    );
}

function Info({ children, open }: { children: React.ReactNode, open }) {
    const ref = React.useRef(null);

    React.useEffect(() => {
        let timeoutId;
        if (open && ref.current instanceof HTMLDialogElement) {
            ref.current.show();
            timeoutId =  setTimeout(() => {
                ref.current.close();
            }, 5000)
        }

        () => clearTimeout(timeoutId);
    }, [open]);

    return (
        <dialog className={style.infoDialog} ref={ref}>
            <Snackbar className={style.info}>
                <SnackbarText>{children}</SnackbarText>
                <SnackbarIconAction onClick={() => ref.current.close()}>
                    <IconClose />
                </SnackbarIconAction>
            </Snackbar>
        </dialog>
    );
}