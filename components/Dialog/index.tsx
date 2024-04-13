"use client";

import React, { ReactHTML } from "react";
import {
    useFloating,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    useMergeRefs,
    FloatingPortal,
    FloatingFocusManager,
    FloatingOverlay,
    useId,
} from "@floating-ui/react";
import style from "./dialog.module.scss";
import clsx from "clsx";

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

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        open,
        onOpenChange: setOpen,
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context, {
        outsidePressEvent: "mousedown",
    });
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return React.useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId],
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

export function Dialog({
    children,
    ...options
}: {
    children: React.ReactNode;
} & DialogOptions) {
    const context = useDialog(options);
    return (
        <DialogContext.Provider value={context}>{children}</DialogContext.Provider>
    );
}

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

export const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(function DialogContent({ className, ...props}, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
        <FloatingPortal>
            <FloatingOverlay className={clsx(style.overlay, "dialog-basic")} lockScroll>
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        aria-labelledby={context.labelId}
                        aria-describedby={context.descriptionId}
                        aria-modal={context.open}
                        {...context.getFloatingProps(props)}
                        className="container"
                    >
                        <div className="state-layer">
                            <div className="content">
                                {props.children}
                            </div>
                        </div>
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
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
>(function DialogBody({ children, ...props }, ref) {
    const { setDescriptionId } = useDialogContext();
    const id = `${useId()}`;

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
    const id = useId();

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
    const id = useId();

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

export const DialogTrigger = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement> & DialogTriggerProps
>(function DialogTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useDialogContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...children.props,
                "data-state": context.open ? "open" : "closed"
            })
        )
    }

    return (
        <button
            ref={ref}
            data-state={context.open ? "open" : "closed"}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    )
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