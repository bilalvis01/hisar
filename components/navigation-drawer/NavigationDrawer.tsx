"use client"

import React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import clsx from "clsx";
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
import style from "./NavigationDrawer.module.scss";

interface NavigationDrawerOptions {
    initialOpen?: boolean,
    open?: boolean,
    onOpenChange?: (open: boolean) => void;
    select?: string;
}

function useNavigationDrawer({
    initialOpen = false,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    select,
}: NavigationDrawerOptions) {
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
            select,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId, select],
    );
}

type ContextType =
    |   (ReturnType<typeof useNavigationDrawer> & {
            setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
            setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
        })
    |   null;

const NavigationDrawerContext = React.createContext<ContextType>(null);

const useNavigationDrawerContext = () => {
    const context = React.useContext(NavigationDrawerContext);

    if (context == null) {
        throw new Error("NavigationDrawer components must be wrapped in <NavigationDrawer />");
    }

    return context;
}

type Variant = "standard" | "modal";

interface NavigationDrawerProps extends NavigationDrawerOptions {
    children: React.ReactNode,
}

export function NavigationDrawer({
    children,
    ...options
}: NavigationDrawerProps) {
    const context = useNavigationDrawer(options);
    return (
        <NavigationDrawerContext.Provider value={context}>{children}</NavigationDrawerContext.Provider>
    );
}

interface NavigationDrawerProps {
    variant?: Variant
};

export const NavigationDrawerContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement> & NavigationDrawerProps
>(function NavigationDrawerContent({ variant = "standard", ...props}, propRef) {
    const { context: floatingContext, ...context } = useNavigationDrawerContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
        <FloatingPortal>
            <FloatingOverlay className={style.overlay} lockScroll>
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        aria-labelledby={context.labelId}
                        aria-describedby={context.descriptionId}
                        aria-modal={context.open}
                        {...context.getFloatingProps(props)}
                        className={clsx("navigation-drawer", variant)}
                    >
                        <div className="container">
                            {props.children}
                        </div>
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
});

interface LinkProps extends NextLinkProps {
    children: React.ReactNode,
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    notification?: number,
};

export function NavigationLink({
    children,
    startIcon,
    endIcon,
    notification = 0,
    href,
    ...props
}: LinkProps) {
    const { select } = useNavigationDrawerContext();

    return (
        <li>
            <NextLink {...props} className={clsx("navigation-button", { active: select == href })} href={href}>
                <div className="container">
                    <div className="active-indicator">
                        <div className="state-layer">
                            <div className="content">
                                {startIcon}
                                <span className="label">{children}</span>
                                {notification > 0 && (
                                    <span className="badge">{notification}</span>
                                )}
                                {endIcon}
                            </div>
                        </div>
                    </div>
                </div>
            </NextLink>
        </li>
    )
}


export const NavigationHeader = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement>
>(function NavigationHeader({ children, ...props }, ref) {
    return (
        <header {...props} className="header" ref={ref}>
            {children}
        </header>
    );
});

export const NavigationHeadline = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLProps<HTMLHeadingElement>
>(function NavigationHeadline({ children, ...props }, ref) {
    const { setLabelId } = useNavigationDrawerContext();
    const id = useId();

    React.useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (
        <h2 {...props} className="headline" ref={ref} id={id} >
            {children}
        </h2>
    );
});

export const NavigationSubhead = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLProps<HTMLHeadingElement>
>(function NavigationSubhead({ children, ...props }, ref) {
    return (
        <h3 {...props} className="headline" ref={ref}>
            {children}
        </h3>
    );
});

export const NavigationBody = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(function NavigationDrawerBody({ children, ...props }, ref) {
    const { setDescriptionId } = useNavigationDrawerContext();
    const id = useId();

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

export const NavigationDrawerClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function NavigationDrawerClose(props, ref) {
    const { setOpen } = useNavigationDrawerContext();

    return (
        <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
    );
});

interface NavigationDrawerTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

export const NavigationDrawerTrigger = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement> & NavigationDrawerTriggerProps
>(function NavigationDrawerTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useNavigationDrawerContext();
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