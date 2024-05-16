"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm,
    FormikHelpers
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
import clsx from "clsx";

interface Error {
    message: string;
}

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
    inputFields: InputField[];
    initialValues: Input | (() => Promise<{ error?: Error; data?: Input; }>);
    validationSchema: any;
    onSubmit: (input: Input, helpers: FormikHelpers<Input>) => Promise<void>;
}

interface FormDialogContext<Input> extends FormDialogOptions<Input> {
    values: Input;
    setValues: React.Dispatch<React.SetStateAction<Input>>;
    screen: Screen;
    isSubmitting: boolean;
    setIsSubmitting: (submitting: boolean) => void;
    error: Error;
    loading: boolean;
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
    inputFields,
    initialValues,
    validationSchema,
    onSubmit,
}: FormDialogOptions<Input>): FormDialogContext<Input> {
    const [values, setValues] = React.useState<Input | null>(null);
    const { screen } = useTemplateContext();
    const [loading, setLoading] = React.useState(true); 
    const [error, setError] = React.useState<{ message: string; } | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            if (initialValues instanceof Function) { 
                initialValues()
                    .then(({ error, data }) => {
                        setValues(data);
                        setError(error);
                    })
                    .finally(() => setLoading(false));
            } else if (initialValues) {
                setValues(initialValues);
                setLoading(false);
            }
        }
    }, [open]);

    return React.useMemo(() => ({
        screen,
        open,
        onOpenChange: setOpen,
        headline,
        values,
        setValues,
        inputFields,
        onSubmit,
        validationSchema,
        initialValues,
        isSubmitting,
        setIsSubmitting,
        error,
        loading,
    }), [
        screen,
        open,
        setOpen,
        headline,
        values, 
        inputFields, 
        onSubmit,
        validationSchema,
        initialValues,
        isSubmitting,
        error,
        loading,
    ]);
};

interface FormProps {
    id: string;
    open: boolean;
    inputSize?: number;
}

function Form({ id, open, inputSize }: FormProps) {
    const { 
        values, 
        setValues, 
        validationSchema, 
        onSubmit, 
        inputFields,
        error,
        loading,
        setIsSubmitting,
    } = useFormDialogContext();

    if (loading) return (
        <div className={style.loading}>
            <ProgressCircular />
        </div>
    );
    if (error) return (
        <div className={clsx(style.error, "text-body-medium")}>
            {error.message}
        </div>
    );

    return (
        <Formik
            initialValues={values}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={onSubmit}
        >
            {({ values, isSubmitting }) => {
                React.useEffect(() => {
                    if (!open) {
                        setValues(values);
                    }
                }, [open]);

                React.useEffect(() => {
                    setIsSubmitting(isSubmitting);
                }, [isSubmitting]);

                return (
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
                );
            }}
        </Formik>
    )
}

function FormDialogCompactScreen() {
    const formId = React.useId();
    const { 
        headline, 
        screen, 
        open, 
        onOpenChange: setOpen,
        isSubmitting,
    } = useFormDialogContext();
    const openThisForm = open && screen === "compact";

    return (
        <DialogFullscreen open={openThisForm} onOpenChange={setOpen}>
            <DialogFullscreenHeader>
                <DialogFullscreenClose></DialogFullscreenClose>
                <DialogFullscreenHeadline>{headline}</DialogFullscreenHeadline>
                <DialogFullscreenAction 
                    form={formId} 
                    disabled={isSubmitting}
                    progress={isSubmitting ? <ProgressCircular size="sm" /> : null}
                >
                    Simpan
                </DialogFullscreenAction>
            </DialogFullscreenHeader>
            <DialogFullscreenBody>
                <Form id={formId} open={openThisForm} inputSize={1} />
            </DialogFullscreenBody>
        </DialogFullscreen>
    );
}

function FormDialogMediumScreen() {
    const formId = React.useId();
    const { 
        headline,
        screen,
        open, 
        onOpenChange: setOpen,
        isSubmitting,
    } = useFormDialogContext();
    const openThisForm = open && (screen === "medium" || screen === "expanded");

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <Dialog open={openThisForm} onOpenChange={setOpen}>
            <DialogHeadline>{headline}</DialogHeadline>
            <DialogBody>
                <Form id={formId} open={openThisForm} />
            </DialogBody>
            <DialogFooter>
                <ButtonText onClick={handleClose}>Batal</ButtonText>
                <ButtonText 
                    type="submit" 
                    form={formId} 
                    disabled={isSubmitting} 
                    progress={isSubmitting ? <ProgressCircular size="sm" /> : null}
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