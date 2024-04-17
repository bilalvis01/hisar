"use client";

import React from "react";
import IconClose from "../icons/Close";

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
            if (open) dialogRef.current.show()
            else dialogRef.current.close()
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

interface DialogProps extends React.HTMLProps<HTMLDialogElement>, DialogOptions {}

export function Dialog({ initialOpen, open, onOpenChange, ...props}: DialogProps) {
    const context = useDialog({ initialOpen, open, onOpenChange });

    return (
        <DialogContext.Provider value={context}>
            <dialog
                aria-labelledby={context.labelId}
                aria-describedby={context.descriptionId}
                aria-modal={context.open}
                {...props}
                ref={context.dialogRef}
                className="dialog-fullscreen"
            />
        </DialogContext.Provider>
    );
};

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
>(function DialogBody({ children, ...props }, ref) {
    const { setDescriptionId } = useDialogContext();
    const id = React.useId();

    React.useLayoutEffect(() => {
        setDescriptionId(id);
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
        <div {...props} className="body" ref={ref} id={id}>
            {children}
        </div>
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

export const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogTrigger(props, ref) {
    const context = useDialogContext();

    return (
        <button
            ref={ref}
            data-state={context.open ? "open" : "closed"}
            {...props}
        />
    )
});

export const DialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogAction({ children, ...props}, ref) {
    return (
        <button
            ref={ref}
            {...props}
            className="action"
        >
            <div className="decorator">
                <div className="base">
                    <div className="state-layer" />
                </div>
            </div>
            <span className="content">
                {children}
            </span>
        </button>
    )
});

export const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
    const { setOpen } = useDialogContext();

    return (
        <button type="button" {...props} className="close" ref={ref} onClick={() => setOpen(false)}>
            <div className="decorator">
                <div className="base">
                    <div className="state-layer" />
                </div>
            </div>
            <IconClose />
        </button>
    );
});