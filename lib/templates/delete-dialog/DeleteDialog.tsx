"use client"

import React from "react";
import {
    Dialog,
    DialogHeadline,
    DialogBody,
    DialogFooter,
    DialogParagraph,
} from "../../components/Dialog";
import { ButtonText } from "../../components/ButtonText";
import ProgressCircular from "../../components/ProgressCircular";

interface DeleteDialogOptions<Values> {
    values: Values;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    headline: string;
    label: string;
    supportingText: string;
    onSubmit: (values: Values) => Promise<void>;
}

interface DeleteDialogContext<Values> extends DeleteDialogOptions<Values> {
    isSubmitting: boolean;
    setIsSubmitting: (isSubmitting: boolean) => void; 
}

const DeleteDialogContext = React.createContext(null);

function useDeleteDialogContext<Values>() {
    const context = React.useContext<DeleteDialogContext<Values>>(DeleteDialogContext);

    if (context == null) {
        throw new Error("Delete dialog components must be wrapped in <DeleteDialog />");
    }

    return context;
}

function useDeleteDialog<Values>({
    values,
    open,
    onOpenChange: setOpen,
    headline,
    label,
    supportingText,
    onSubmit,
}: DeleteDialogOptions<Values>): DeleteDialogContext<Values> {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    return React.useMemo(() => ({
        values,
        open,
        onOpenChange: setOpen,
        headline,
        supportingText,
        label,
        onSubmit,
        isSubmitting,
        setIsSubmitting,
    }), [
        values,
        open,
        setOpen,
        headline,
        supportingText,
        label,
        onSubmit,
        isSubmitting,
    ]);
};

function DeleteDialogBase() {
    const formId = React.useId();
    const { 
        values,
        headline,
        supportingText,
        open, 
        onOpenChange: setOpen,
        isSubmitting,
        setIsSubmitting,
        onSubmit: handleSubmit_
    } = useDeleteDialogContext();

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const handleSubmit = React.useCallback(() => {
        handleSubmit_(values).then(() => setIsSubmitting(false));
        setIsSubmitting(true);
    }, [values]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeadline>{headline}</DialogHeadline>
            <DialogBody>
                <DialogParagraph>{supportingText}</DialogParagraph>
            </DialogBody>
            <DialogFooter>
                <ButtonText onClick={handleClose}>Batal</ButtonText>
                <ButtonText 
                    type="submit" 
                    form={formId} 
                    disabled={isSubmitting} 
                    progress={isSubmitting ? <ProgressCircular size="sm" /> : null}
                    onClick={handleSubmit}
                >
                    Ya
                </ButtonText>
            </DialogFooter>
        </Dialog>
    );
}

export default function DeleteDialog<Values>(props: DeleteDialogOptions<Values>) {
    const context = useDeleteDialog(props);

    return (
        <DeleteDialogContext.Provider value={context}>
            <DeleteDialogBase />
        </DeleteDialogContext.Provider>
    );
}