"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm,
} from "formik";
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
import { ButtonText } from "../../components/ButtonText";
import ProgressCircular from "../../components/ProgressCircular";
import { Option as SelectOption, OpenMenuHandler as SelectOpenMenuHandler } from "../select/Select";
import Select from "../select/Select";
import { useTemplateContext, Screen } from "../Template";

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
    open: boolean;
    onOpenChange: (open: boolean) => void;
    headline: string;
    message: string;
    success: boolean;
    loading: boolean;
    inputFields: InputField[];
    initialValues: Input;
    enableReinitialize?: boolean;
    validationSchema: any;
    onSubmit: (input: Input) => Promise<void>;
    onOpenForm?: () => Promise<{ error?: { message: string; }; data?: Input; }>;
}

interface FormDialogContext<Input> extends FormDialogOptions<Input> {
    values: Input;
    setValues: React.Dispatch<React.SetStateAction<Input>>;
    screen: Screen;
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
    open,
    onOpenChange: setOpen,
    headline,
    message,
    success,
    loading,
    inputFields,
    initialValues,
    enableReinitialize,
    validationSchema,
    onSubmit,
    onOpenForm,
}: FormDialogOptions<Input>): FormDialogContext<Input> {
    const [values, setValues] = React.useState<Input>(initialValues);
    const { screen } = useTemplateContext();

    React.useEffect(() => {
        if (!open) setValues(initialValues);
    }, [open]);

    React.useEffect(() => {
        if (success) setOpen(false);
    }, [success]);

    return React.useMemo(() => ({
        screen,
        open,
        onOpenChange: setOpen,
        headline,
        values,
        setValues,
        message,
        success,
        loading,
        inputFields,
        onSubmit,
        onOpenForm,
        validationSchema,
        initialValues,
        enableReinitialize,
    }), [
        screen,
        open,
        setOpen,
        headline,
        values, 
        message, 
        success, 
        loading, 
        inputFields, 
        onSubmit,
        onOpenForm,
        validationSchema,
        initialValues,
        enableReinitialize,
    ]);
};

interface FormProps {
    id: string;
    open: boolean;
    inputSize?: number;
}

function Form({ id, open, inputSize }: FormProps) {
    /* When a form dialog is going to close, at the same time the form will be unmounted.
    `preparingUnmount` give the form a time to save its values to values state */
    const [preparingUnmount, setPreparingUnmount] = React.useState(true);
    /* when another form dialog is going to close, than the dialog's form will save its values to values state.
    But at the same time the current dialog is opening, at this point the values state still had the old values.
    `preparingMount` give the another dialog's form a time to refresh the state with the new values.
    */
    const [preparingMount, setPreparingMount] = React.useState(true);
    
    const [loading, setLoading] = React.useState(false); 
    const [error, setError] = React.useState<null | { message: string; }>(null);

    const { 
        values, 
        setValues, 
        validationSchema, 
        onSubmit, 
        inputFields, 
        enableReinitialize,
        onOpenForm: handleOpenForm,
    } = useFormDialogContext();

    React.useEffect(() => {
        if (open) {
            setPreparingUnmount(true);
            setPreparingMount(false);
        } else {
            setPreparingUnmount(false);
            setPreparingMount(true);
        }
    }, [open]); 

    React.useEffect(() => {
        if (open && handleOpenForm) {
            setLoading(true);
            handleOpenForm()
                .then(({ error, data }) => {
                    setValues(data);
                    setError(error);
                })
                .finally(() => setLoading(false));
        }
    }, [open]);

    if (loading) return <ProgressCircular />;
    if (error) return error.message;

    if ((!open && !preparingUnmount) || (open && preparingMount)) return null;

    return (
        <Formik
            initialValues={values}
            validationSchema={validationSchema}
            enableReinitialize={enableReinitialize}
            onSubmit={onSubmit}
        >
            {({ values, setValues }) => {
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

function FormDialogCompactScreen() {
    const formId = React.useId();
    const fabDialogRef = React.useRef(null);
    const [infoStyle, setInfoStyle] = React.useState({});
    const { 
        headline, 
        screen, 
        open: open_, 
        onOpenChange: setOpen,
        success, 
        loading, 
        message,
    } = useFormDialogContext();
    const open = open_ && screen === "compact";

    return (
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
    );
}

function FormDialogMediumScreen() {
    const formId = React.useId();
    const { 
        headline,
        screen,
        open: open_, 
        onOpenChange: setOpen, 
        success, 
        loading, 
        message,
    } = useFormDialogContext();
    const open = open_ && (screen === "medium" || screen === "expanded");

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeadline>{headline}</DialogHeadline>
            <DialogBody>
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
    );
}

export default function FormDialog<Input>(props: FormDialogOptions<Input>) {
    const context = useFormDialog(props);

    return (
        <FormDialogContext.Provider value={context}>
            <FormDialogMediumScreen />
            <FormDialogCompactScreen />
        </FormDialogContext.Provider>
    );
}