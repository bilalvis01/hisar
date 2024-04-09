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
    const Dialog = useDialog(options);
    return (
        <DialogContext.Provider value={Dialog}>{children}</DialogContext.Provider>
    );
}

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

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

export const DialogContent = React.forwardRef<
    HTMLDivElement,
    { overlay?: string } & React.HTMLProps<HTMLDivElement>
>(function DialogContent(props, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
        <FloatingPortal>
            <FloatingOverlay className={props.overlay} lockScroll>
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        aria-labelledby={context.labelId}
                        aria-describedby={context.descriptionId}
                        aria-modal={context.open}
                        {...context.getFloatingProps(props)}
                    >
                        {props.children}
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
});

export const DialogHeading = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLProps<HTMLHeadingElement>
>(function DialogHeading({ children, ...props }, ref) {
    const { setLabelId } = useDialogContext();
    const id = useId();

    React.useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (
        <h2 {...props} ref={ref} id={id}>
            {children}
        </h2>
    );
});

export const DialogDescription = React.forwardRef<
    HTMLDivElement | HTMLParagraphElement,
    React.HTMLProps<HTMLDivElement | HTMLParagraphElement>
>(function DialogDescription({ children, ...props }, ref) {
    const { setDescriptionId } = useDialogContext();
    const id = useId();

    React.useLayoutEffect(() => {
        setDescriptionId(id);
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
        <div {...props} ref={ref} id={id}>
            {children}
        </div>
    );
})

export const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
    const { setOpen } = useDialogContext();

    return (
        <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
    );
});