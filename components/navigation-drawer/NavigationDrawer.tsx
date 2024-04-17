"use client"

import React from "react";
import clsx from "clsx";

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
    const dialogRef = React.useRef(null);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;
    
    React.useEffect(() => {
        if (dialogRef.current instanceof HTMLDialogElement) {
            if (open) dialogRef.current.showModal()
            else dialogRef.current.close()
        }
    }, [open])

    return React.useMemo(
        () => ({
            open,
            setOpen,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
            select,
            dialogRef,
        }),
        [open, setOpen, labelId, descriptionId, select],
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

interface NavigationDrawerProps extends NavigationDrawerOptions, React.HTMLProps<HTMLDialogElement> {
    variant?: Variant
}

export function NavigationDrawer({ 
    variant = "standard", 
    initialOpen, 
    open, 
    onOpenChange,
    select, 
    ...props
}: NavigationDrawerProps) {
    const context = useNavigationDrawer({ initialOpen, open, onOpenChange, select });

    return (
        <NavigationDrawerContext.Provider value={context}>
            <dialog
                ref={context.dialogRef}
                aria-labelledby={context.labelId}
                aria-describedby={context.descriptionId}
                aria-modal={context.open}
                className={clsx("navigation-drawer", variant)}
            >
                {props.children}
            </dialog>
        </NavigationDrawerContext.Provider>
    );
};

interface NavigationLinkProps extends React.HTMLProps<HTMLAnchorElement> {
    children: React.ReactNode,
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    notification?: number,
};

export const NavigationLink = React.forwardRef<
    HTMLAnchorElement,
    NavigationLinkProps
>(function NavigationLink({
    children,
    startIcon,
    endIcon,
    notification = 0,
    href,
    ...props
}, ref) {
    const { select } = useNavigationDrawerContext();

    return (
        <a {...props} href={href} className={clsx("navigation-button", { active: select == href })}>
            <div className="decorator">
                <div className="base">
                    <div className="active-indicator">
                        <div className="state-layer" />
                    </div>
                </div>
            </div>
            <span className="content">
                {startIcon}
                <span className="label">{children}</span>
                {notification > 0 && (
                    <span className="badge">{notification}</span>
                )}
                {endIcon}
            </span>
        </a>
    )
})


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
    const id = React.useId();

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

export const NavigationDrawerClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function NavigationDrawerClose(props, ref) {
    const { setOpen } = useNavigationDrawerContext();

    return (
        <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
    );
});