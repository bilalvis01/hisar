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

interface DeleteDialogOptions<Input> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    headline: string;
    label: string;
    supportingText: string;
    message?: string;
    success?: boolean;
    loading?: boolean;
}

interface DeleteDialogContext<Input> extends DeleteDialogOptions<Input> {}

const DeleteDialogContext = React.createContext(null);

function useDeleteDialogContext<Input>() {
    const context = React.useContext<DeleteDialogContext<Input>>(DeleteDialogContext);

    if (context == null) {
        throw new Error("Delete dialog components must be wrapped in <DeleteDialog />");
    }

    return context;
}

function useDeleteDialog<Input>({
    open,
    onOpenChange: setOpen,
    headline,
    label,
    supportingText,
    message,
    success,
    loading,
}: DeleteDialogOptions<Input>): DeleteDialogContext<Input> {
    React.useEffect(() => {
        if (success) setOpen(false);
    }, [success]);

    return React.useMemo(() => ({
        open,
        onOpenChange: setOpen,
        headline,
        supportingText,
        label,
        message,
        success,
        loading,
    }), [
        open,
        setOpen,
        headline,
        supportingText,
        label,
        message, 
        success, 
        loading, 
    ]);
};

function DeleteDialogBase() {
    const formId = React.useId();
    const { 
        headline,
        supportingText,
        open, 
        onOpenChange: setOpen,  
        loading,
    } = useDeleteDialogContext();

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

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
                    disabled={loading} 
                    progress={loading ? <ProgressCircular size="sm" /> : null}
                >
                    Ya
                </ButtonText>
            </DialogFooter>
        </Dialog>
    );
}

export default function DeleteDialog<Input>(props: DeleteDialogOptions<Input>) {
    const context = useDeleteDialog(props);

    return (
        <DeleteDialogContext.Provider value={context}>
            <DeleteDialogBase />
        </DeleteDialogContext.Provider>
    );
}