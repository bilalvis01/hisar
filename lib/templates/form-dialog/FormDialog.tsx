"use client"

import React from "react";
import { 
    Formik, 
    Form as FormikForm,
    FormikHelpers
} from "formik";
import TextField from "../text-field/TextField";
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
import { Option as SelectOption, OpenMenuHandler as SelectOpenMenuHandler } from "../../components/SelectOutlined";
import Select from "../select/Select";
import { useTemplateContext, WindowSize } from "../Template";
import clsx from "clsx";
import TextareaOutlined from "../textarea-outlined/TextareaOutlined";

interface Error {
    message: string;
}

export type InputFieldType = "text" | "textarea" | "number" | "select"; 

export interface InputField {
    type: InputFieldType;
    name: string;
    label: string;
    disabled?: boolean;
    autoFocus?: boolean;
    options?: SelectOption[];
    onOpenMenu?: SelectOpenMenuHandler;
}

interface Classes {
    formDialogBodyMediumSizeScreen?: string;
}

interface FormDialogOptions<Values> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    headline: string;
    inputFields: InputField[];
    initialValues: Values | (() => Promise<{ error?: Error; values?: Values; }>);
    validationSchema: any;
    onSubmit: (values: Values, helpers: FormikHelpers<Values>) => Promise<void>;
    actionLabel?: string;
    classes?: Classes;
}

interface FormDialogContext<Values> extends FormDialogOptions<Values> {
    values: Values;
    setValues: React.Dispatch<React.SetStateAction<Values>>;
    windowSize: WindowSize;
    isSubmitting: boolean;
    setIsSubmitting: (submitting: boolean) => void;
    error: Error;
    loading: boolean;
}

const FormDialogContext = React.createContext(null);

function useFormDialogContext<Values>() {
    const context = React.useContext<FormDialogContext<Values>>(FormDialogContext);

    if (context == null) {
        throw new Error("Form dialog components must be wrapped in <FormDialog />");
    }

    return context;
}

function useFormDialog<Values>({
    open,
    onOpenChange: setOpen,
    headline,
    inputFields,
    initialValues,
    validationSchema,
    onSubmit,
    actionLabel = "Simpan",
    classes = {},
}: FormDialogOptions<Values>): FormDialogContext<Values> {
    const [values, setValues] = React.useState<Values | null>(null);
    const { windowSize } = useTemplateContext();
    const [loading, setLoading] = React.useState(true); 
    const [error, setError] = React.useState<{ message: string; } | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            if (initialValues instanceof Function) { 
                initialValues()
                    .then(({ error, values }) => {
                        setValues(values);
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
        windowSize,
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
        actionLabel,
        classes,
    }), [
        windowSize,
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
        actionLabel,
        classes,
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

                            if (type === "textarea") {
                                return (
                                    <TextareaOutlined
                                        key={name} 
                                        name={name} 
                                        label={label} 
                                        disabled={disabled}
                                        autoFocus={autoFocus}
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
        windowSize, 
        open, 
        onOpenChange: setOpen,
        isSubmitting,
        actionLabel,
    } = useFormDialogContext();
    const openThisForm = open && windowSize === "compact";

    return (
        <DialogFullscreen open={openThisForm} onOpenChange={setOpen}>
            <DialogFullscreenHeader>
                <DialogFullscreenClose></DialogFullscreenClose>
                <DialogFullscreenHeadline>{headline}</DialogFullscreenHeadline>
                <DialogFullscreenAction 
                    form={formId} 
                    disabled={isSubmitting}
                    progress={isSubmitting}
                >
                    {actionLabel}
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
        windowSize,
        open, 
        onOpenChange: setOpen,
        isSubmitting,
        actionLabel,
        classes,
    } = useFormDialogContext();
    const openThisForm = open && (windowSize === "medium" || windowSize === "expanded");

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <Dialog open={openThisForm} onOpenChange={setOpen}>
            <DialogHeadline>{headline}</DialogHeadline>
            <DialogBody className={classes.formDialogBodyMediumSizeScreen}>
                <Form id={formId} open={openThisForm} />
            </DialogBody>
            <DialogFooter>
                <ButtonText onClick={handleClose}>Batal</ButtonText>
                <ButtonText 
                    type="submit" 
                    form={formId} 
                    disabled={isSubmitting} 
                    progress={isSubmitting}
                >
                    {actionLabel}
                </ButtonText>
            </DialogFooter>
        </Dialog>
    );
}

export default function FormDialog<Values>(props: FormDialogOptions<Values>) {
    const context = useFormDialog(props);

    return (
        <FormDialogContext.Provider value={context}>
            <FormDialogMediumScreen />
            <FormDialogCompactScreen />
        </FormDialogContext.Provider>
    );
}