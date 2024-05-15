"use client"

import React from "react";
import { createPortal } from "react-dom";
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
import { ButtonText } from "../../components/ButtonText";
import { 
    Snackbar, 
    SupportingText as SnackbarText, 
    IconAction as SnackbarIconAction 
} from "../../components/Snackbar";
import IconClose from "../../icons/Close";
import ProgressCircular from "../../components/ProgressCircular";
import { Option as SelectOption, OpenMenuHandler as SelectOpenMenuHandler } from "../select/Select";
import Select from "../select/Select";
import useMergeRefs from "../../hooks/useMergeRefs";

interface InputField {
    type: string;
    name: string;
    label: string;
    disabled?: boolean;
    autoFocus?: boolean;
    options?: SelectOption[];
    onOpenMenu?: SelectOpenMenuHandler;
}

interface FormDialogOptions<Input> {
    headline: string;
    label: string;
    message: string;
    success: boolean;
    loading: boolean;
    inputFields: InputField[];
    initialValues: Input;
    enableReinitialize?: boolean;
    validationSchema: any;
    fab?: boolean;
    fabIcon?: React.ReactNode;
    onSubmit: (input: Input) => Promise<void>;
    onCloseInfo?: () => void;
}

interface FormDialogContext<Input> extends FormDialogOptions<Input> {
    values: Input;
    setValues: React.Dispatch<React.SetStateAction<Input>>;
    media: string;
    open: boolean;
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
    headline,
    label,
    message,
    success,
    loading,
    inputFields,
    initialValues,
    enableReinitialize,
    validationSchema,
    fab = false,
    fabIcon,
    onSubmit,
    onCloseInfo,
}: FormDialogOptions<Input>): FormDialogContext<Input> {
    const [values, setValues] = React.useState<Input>(initialValues);
    const [media, setMedia] = React.useState<"desktop" | "mobile">("desktop");
    const [open, setOpen] = React.useState(false);

    const handleMedia = React.useCallback(() => {
        if (window.innerWidth < 600) setMedia("mobile");
        else setMedia("desktop");
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", handleMedia);

        return () => window.removeEventListener("resize", handleMedia);
    });

    React.useEffect(() => {
        handleMedia();
    }, []);

    React.useEffect(() => {
        if (!open) setValues(initialValues);
    }, [open]);

    React.useEffect(() => {
        if (success) setOpen(false);
    }, [success]);

    return React.useMemo(() => ({
        media,
        open,
        onOpenChange: setOpen,
        headline,
        label,
        values,
        setValues,
        message,
        success,
        loading,
        inputFields,
        onSubmit,
        onCloseInfo,
        validationSchema,
        initialValues,
        enableReinitialize,
        fab,
        fabIcon,
    }), [
        media,
        open,
        headline,
        label,
        values, 
        message, 
        success, 
        loading, 
        inputFields, 
        onSubmit,
        onCloseInfo,
        validationSchema,
        initialValues,
        enableReinitialize,
        fab,
        fabIcon,
    ]);
};

interface FormProps {
    id: string;
    open: boolean;
}

function Form({ id, open, inputSize }: { id: string, open: boolean, inputSize?: number }) {
    /* When a form dialog is going to close, at the same time the form will be unmounted.
    `preparingUnmount` give the form a time to save its values to values state */
    const [preparingUnmount, setPreparingUnmount] = React.useState(true);
    /* when another form dialog is going to close, than the dialog's form will save its values to values state.
    But at the same time the current dialog is opening, at this point the values state still had the old values.
    `preparingMount` give the another dialog's form a time to refresh the state with the new values.
    */
    const [preparingMount, setPreparingMount] = React.useState(true);

    const { values, setValues, validationSchema, onSubmit, inputFields, enableReinitialize } = useFormDialogContext();

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
            enableReinitialize={enableReinitialize}
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
                                const {
                                    type,
                                    name,
                                    label,
                                    disabled,
                                    autoFocus,
                                    options,
                                    onOpenMenu,
                                } = { 
                                    ...{ disabled: false, autoFocus: false },
                                    ...inputField
                                }

                                if (type === "select") {
                                    return (
                                        <Select 
                                            key={name} 
                                            name={name} 
                                            label={label} 
                                            disabled={disabled}
                                            autoFocus={autoFocus}
                                            options={options} 
                                            size={inputSize ?? 1}
                                            onOpenMenu={onOpenMenu}
                                        />
                                    );
                                }
                            

                                return (
                                    <TextField 
                                        key={name}
                                        className={style.field} 
                                        type={type} 
                                        label={label}
                                        name={name}
                                        disabled={disabled}
                                        autoFocus={autoFocus}
                                        size={inputSize}
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
    const fabDialogRef = React.useRef(null);
    const [infoStyle, setInfoStyle] = React.useState({});
    const { 
        headline, 
        media, 
        open: open_, 
        onOpenChange: setOpen, 
        success, 
        loading, 
        message,
        fab,
        fabIcon,
    } = useFormDialogContext();
    const open = open_ && media === "mobile";

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    React.useEffect(() => {
        if (fabDialogRef.current instanceof HTMLDialogElement) {
            if (fab && media === "mobile") {
                fabDialogRef.current.show();
                const rect = fabDialogRef.current.getBoundingClientRect();
                setInfoStyle({ bottom: `calc(${window.innerHeight - rect.top}px + 1rem)` });
            } else {
                fabDialogRef.current.close();
            }
        }
    }, [fab, media]);

    return (
        <>
            {createPortal(
                <Info open={open && success} style={infoStyle}>{message}</Info>,
                document.body
            )}
            {createPortal(
                <dialog ref={fabDialogRef} className={style.fabDialog}>
                    <FabPrimary className={style.fab} onClick={handleOpen}>
                        {fabIcon}
                    </FabPrimary>
                </dialog>,
                document.body
            )}
            <DialogFullscreen open={open} onOpenChange={setOpen}>
                <DialogFullscreenHeader>
                    <DialogFullscreenClose></DialogFullscreenClose>
                    <DialogFullscreenHeadline>{headline}</DialogFullscreenHeadline>
                    <DialogFullscreenAction 
                        form={formId} 
                        disabled={loading}
                        progress={loading ? <ProgressCircular size="sm" /> : null}
                    >
                        Simpan
                    </DialogFullscreenAction>
                </DialogFullscreenHeader>
                <DialogFullscreenBody>
                    <Form id={formId} open={open} inputSize={1} />
                </DialogFullscreenBody>
            </DialogFullscreen>
        </>
    );
}

function FormDialogDesktop() {
    const formId = React.useId();
    const { 
        headline,
        label,
        media,
        open: open_, 
        onOpenChange: setOpen, 
        success, 
        loading, 
        message,
        fab,
    } = useFormDialogContext();
    const open = open_ && media === "desktop";
            
    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <>
            {(!fab || media === "desktop") && (
                <ButtonFilled onClick={handleOpen}>
                    {label}
                </ButtonFilled>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogHeadline>{headline}</DialogHeadline>
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
            {createPortal(
                <Info open={open && success}>{message}</Info>,
                document.body
            )}
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

const Info = React.forwardRef<
    HTMLDialogElement,
    { children: React.ReactNode; open: boolean; } & React.HTMLProps<HTMLDialogElement>
>(function Info({ children, open, ...props }, propRef) {
    const dialogRef = React.useRef(null);
    const ref = useMergeRefs([dialogRef, propRef]);
    const { onCloseInfo } = useFormDialogContext();

    const handleClose = () => {
        if (onCloseInfo) onCloseInfo();
        if (dialogRef.current instanceof HTMLDialogElement) dialogRef.current.close();
    };

    React.useEffect(() => {
        let timeoutId;

        if (open) {
            if (dialogRef.current instanceof HTMLDialogElement) dialogRef.current.show();

            timeoutId =  setTimeout(() => {
                if (onCloseInfo) onCloseInfo();
                if (dialogRef.current instanceof HTMLDialogElement) dialogRef.current.close();
            }, 5000);
        }

        () => clearTimeout(timeoutId);
    }, [open]);

    return (
        <dialog {...props} className={style.infoDialog} ref={ref}>
            <Snackbar className={style.info}>
                <SnackbarText>{children}</SnackbarText>
                <SnackbarIconAction onClick={handleClose}>
                    <IconClose />
                </SnackbarIconAction>
            </Snackbar>
        </dialog>
    );
});