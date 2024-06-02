"use client";

import React, { ReactHTML } from "react";
import clsx from "clsx";
import useMergeRefs from "../hooks/useMergeRefs";

interface DialogOptions {
    initialOpen?: boolean,
    open?: boolean,
    onOpenChange?: (open: boolean) => void;
}

export function useDialog({
    initialOpen = false,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: DialogOptions) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
    const [labelId, setLabelId] = React.useState<string | undefined>();
    const [descriptionId, setDescriptionId] = React.useState<string | undefined>();
    const dialogRef = React.useRef(null);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    React.useEffect(() => {
        if (dialogRef.current instanceof HTMLDialogElement) {
            if (open) dialogRef.current.showModal();
            else dialogRef.current.close();
        }
    }, [open]);

    return React.useMemo(
        () => ({
            open,
            setOpen,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
            dialogRef,
        }),
        [open, setOpen, labelId, descriptionId],
    );
}

type ContextType =
    |   (ReturnType<typeof useDialog> & {
            setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
            setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
        })
    |   null;

const DialogContext = React.createContext<ContextType>(null);

export const useDialogContext = () => {
    const context = React.useContext(DialogContext);

    if (context == null) {
        throw new Error("Dialog components must be wrapped in <Dialog />");
    }

    return context;
}

export const Dialog = React.forwardRef<
    HTMLDialogElement,
    React.HTMLProps<HTMLDialogElement> & DialogOptions
>(function Dialog({ initialOpen, className, open, onOpenChange, ...props }, propRef) {
    const context = useDialog({ initialOpen, open, onOpenChange });
    const dialogRef = useMergeRefs([context.dialogRef, propRef]);

    return (
        <DialogContext.Provider value={context}>
            <dialog
                aria-labelledby={context.labelId}
                aria-describedby={context.descriptionId}
                aria-modal={context.open}
                {...props}
                ref={dialogRef}
                className="dialog-basic"
            >
                <div className="container">
                    <div className="decorator">
                        <div className="state-layer" />
                    </div>
                    <div className={clsx("content", className)}>
                        {props.children}
                    </div>
                </div>
            </dialog>
        </DialogContext.Provider>
    );
});

export const DialogHeader = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement>
>(function DialogHeader({ children, ...props }, ref) {
    return (
        <header {...props} className="header" ref={ref}>
            {children}
        </header>
    );
});

export const DialogBody = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(function DialogBody({ children, className, ...props }, ref) {
    const { setDescriptionId } = useDialogContext();
    const id = React.useId();

    React.useLayoutEffect(() => {
        setDescriptionId(id);
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
        <div {...props} className={clsx("body", className)} ref={ref} id={id}>
            {children}
        </div>
    );
});

export const DialogFooter = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement>
>(function DialogFooter({ children, className, ...props }, ref) {
    return (
        <footer {...props} className={clsx("footer", className)} ref={ref}>
            {children}
        </footer>
    );
});

export const DialogHeadline = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLProps<HTMLHeadingElement>
>(function DialogHeadline({ children, ...props }, ref) {
    const { setLabelId } = useDialogContext();
    const id = React.useId();

    React.useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (
        <h2 {...props} className="headline" ref={ref} id={id}>
            {children}
        </h2>
    );
});

export const DialogSubhead = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLProps<HTMLHeadingElement>
>(function DialogSubhead({ children, ...props }, ref) {
    return (
        <h3 {...props} className="subhead" ref={ref}>
            {children}
        </h3>
    );
});

export const DialogParagraph = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(function DialogParagraph({ children, ...props }, ref) {
    const { descriptionId, setDescriptionId } = useDialogContext();
    const id = React.useId();

    React.useLayoutEffect(() => {
        if (!descriptionId) {
            setDescriptionId(id);
        }
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
        <p {...props} className="supporting-text" ref={ref} id={!descriptionId ? id : null}>
            {children}
        </p>
    );
});

export const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
    const { setOpen } = useDialogContext();

    return (
        <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
    );
});