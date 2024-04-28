"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm,
} from "formik";
import ButtonFilled from "../../components/ButtonFIlled";
import TextField from "../TextField";
import style from "./FormDialog.module.scss";
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
import { 
    Snackbar, 
    SupportingText as SnackbarText, 
    IconAction as SnackbarIconAction 
} from "../../components/Snackbar";
import IconClose from "../../icons/Close";
import ProgressCircular from "../../components/ProgressCircular";
import { Option as SelectOption, OpenMenuHandler as SelectOpenMenuHandler } from "../select/Select";
import Select from "../select/Select";

interface InputField {
    type: string;
    name: string;
    label: string;
    options?: SelectOption[];
    onOpenMenu?: SelectOpenMenuHandler;
}

interface FormDialogOptions<Input> {
    message: string;
    success: boolean;
    loading: boolean;
    inputFields: InputField[];
    initialValues: Input;
    validationSchema: any;
    onSubmit: (input: Input) => Promise<void>;
}

interface FormDialogContext<Input> extends FormDialogOptions<Input> {
    values: Input;
    setValues: React.Dispatch<React.SetStateAction<Input>>;
    dialog: string;
    onOpenChange: (open: boolean) => void;
}

const FormDialogContext = React.createContext(null);

function useFormDialogContext<Input>() {
    const context = React.useContext<FormDialogContext<Input>>(FormDialogContext);

    if (context == null) {
        throw new Error("Form dialog components must be wrapped in <FormDialog />");
    }

    return context;
}

function useFormDialog<Input>({
    message,
    success,
    loading,
    inputFields,
    initialValues,
    validationSchema,
    onSubmit,
}: FormDialogOptions<Input>): FormDialogContext<Input> {
    const [dialog, setDialog] = React.useState<"none" | "desktop" | "mobile">("none");
    const [values, setValues] = React.useState<Input>(initialValues);

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
        message,
        success,
        loading,
        inputFields,
        onSubmit,
        validationSchema,
        initialValues,
    }), [
        dialog, 
        values, 
        message, 
        success, 
        loading, 
        inputFields, 
        onSubmit,
        validationSchema,
        initialValues,
    ]);
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

    const { values, setValues, validationSchema, onSubmit, inputFields } = useFormDialogContext();

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
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ values }) => {
                React.useEffect(() => {
                    if (!open) setValues(values);
                }, [open]); 

                return (
                    <>
                        <FormikForm id={id}>
                            {inputFields.map((inputField) => {
                                if (inputField.type === "select") {
                                    return (
                                        <Select 
                                            key={inputField.name} 
                                            name={inputField.name} 
                                            label={inputField.label} 
                                            options={inputField.options} 
                                            onOpenMenu={inputField.onOpenMenu}
                                        />
                                    );
                                }
                            

                                return (
                                    <TextField key={inputField.name}
                                        className={style.field} 
                                        type={inputField.type} 
                                        label={inputField.label}
                                        name={inputField.name}
                                    /> 
                                );
                            })}
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
    const { dialog, onOpenChange: setOpen, success, loading } = useFormDialogContext();
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
        if (success) setOpen(false);
    }, [success]);

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
    const { 
        dialog, 
        onOpenChange: setOpen, 
        success, 
        loading, 
        message,
    } = useFormDialogContext();
    const open = dialog === "desktop";
            
    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    React.useEffect(() => {
        if (success) setOpen(false);
    }, [success]);

    return (
        <>
            <ButtonFilled onClick={handleOpen}>
                Tambah
            </ButtonFilled>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeadline>Tambah Budget</DialogHeadline>
                <DialogBody className={style.dialogBody}>
                    {!success && <div>{message}</div>}
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
            <Info open={success}>{message}</Info>
        </>
    );
}

export default function FormDialog<Input>(props: FormDialogOptions<Input>) {
    const context = useFormDialog(props);

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