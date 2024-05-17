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
import style from "./DeleteDialog.module.scss";
import clsx from "clsx";

interface Error {
    message: string;
}

interface Data<Values> {
    values?: Values;
    error?: Error;
    headline: string;
    supportingText: string;
}

interface DeleteDialogOptions<Values> {
    data: Data<Values> | (() => Promise<Data<Values>>) | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: Values) => Promise<void>;
}

export default function DeleteDialog<Values>({
    data: data_,
    open,
    onOpenChange: setOpen,
    onSubmit: handleSubmit_,
}: DeleteDialogOptions<Values>) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [data, setData] = React.useState<Data<Values> | null>(null);
    const [loading, setLoading] = React.useState(true); 
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (open) {
            if (data_ instanceof Function) { 
                data_()
                    .then((data) => {
                        setData(data);
                        setError(data.error);
                    })
                    .finally(() => setLoading(false));
            } else if (data_) {
                setData(data_);
                setLoading(false);
            }
        }
    }, [open]);

    const values = data ? data.values : null;

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const handleSubmit = React.useCallback(() => {
        handleSubmit_(values).then(() => setIsSubmitting(false));
        setIsSubmitting(true);
    }, [values]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeadline>{data && data.headline}</DialogHeadline>
            <DialogBody>
                {loading && (
                    <div className={style.loading}>
                        <ProgressCircular />
                    </div>
                )}
                {error && (
                    <div className={clsx(style.error, "text-body-medium")}>
                        {error.message}
                    </div>
                )}
                {data && (
                    <DialogParagraph>{data.supportingText}</DialogParagraph>
                )}
            </DialogBody>
            <DialogFooter>
                <ButtonText onClick={handleClose}>Batal</ButtonText>
                <ButtonText 
                    type="submit"
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