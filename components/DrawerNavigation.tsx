"use client";

import React from "react";
import style from "./drawer-navigation.module.scss";
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
import Logo from "./Logo";
import Navigation from "./Navigation";

interface DrawerOptions {
    initialOpen?: boolean,
    open?: boolean,
    onOpenChange?: (open: boolean) => void;
}

export function useDrawer({
    initialOpen = false,
    open,
    onOpenChange: setOpen,
}: DrawerOptions) {
    const [controlledId, setControlledId] = React.useState<string | undefined>();

    const data = useFloating({
        open,
        onOpenChange: setOpen,
    });

    const context = data.context;

    const click = useClick(context);
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
            controlledId,
            setControlledId
        }),
        [open, setOpen, interactions, data, controlledId],
    );
}

type ContextType =
    |   (ReturnType<typeof useDrawer> & {
            setControlledId: React.Dispatch<React.SetStateAction<string | undefined>>;
        })
    |   null;

const DrawerContext = React.createContext<ContextType>(null);

export const useDrawerContext = () => {
    const context = React.useContext(DrawerContext);

    if (context == null) {
        throw new Error("Drawer components must be wrapped in <Drawer />");
    }

    return context;
}

export function Drawer({
    children,
    ...options
}: {
    children: React.ReactNode;
} & DrawerOptions) {
    const drawer = useDrawer(options);
    return (
        <DrawerContext.Provider value={drawer}>{children}</DrawerContext.Provider>
    );
}

interface DrawerTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement> & DrawerTriggerProps
>(function DrawerTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useDrawerContext();
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
            aria-controls={context.controlledId}
            aria-expanded={context.open}
            aria-label="Open Drawer"
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    )
});

export const DrawerContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(function DrawerContent(props, propRef) {
    const { context: floatingContext, setControlledId, ...context } = useDrawerContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);
    const id = useId();

    React.useEffect(() => {
        setControlledId(id);
        return () => setControlledId(undefined);
    }, [id, setControlledId])

    if (!floatingContext.open) return null;

    return (
        <FloatingPortal>
            <FloatingOverlay className={style.overlay} lockScroll>
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        id={context.controlledId}
                        {...context.getFloatingProps(props)}
                    >
                        {props.children}
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
});

export const DrawerClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DrawerClose(props, ref) {
    const { setOpen } = useDrawerContext();

    return (
        <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
    );
});

export default function DrawerNavigation() {
    const [open, setOpen] = React.useState(false);
    const drawer = useDrawer({ open, onOpenChange: setOpen });

    const handleResize = React.useCallback(() => {
        if (window.innerWidth >= 992) {
            setOpen(false);
        }
    }, [setOpen]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return (
        <DrawerContext.Provider value={drawer}>
            <nav aria-label="Drawer Navigation" className={style.nav}>
                <DrawerTrigger className={style.trigger}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </DrawerTrigger>
                <DrawerContent className={style.dialog}>
                    <header className={style.header}>
                        <Logo className={style.logo} />
                        <DrawerClose className={style.close}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                            </svg>
                        </DrawerClose>
                    </header>
                    <div>
                        <Navigation 
                            role="menu" 
                            ariaLabel="Drawer Navigation" 
                            classes={{ root: style.navigationBar, menuItem: style.navigationItem }} 
                        />
                    </div>
                </DrawerContent>
            </nav>
        </DrawerContext.Provider>
    );
}