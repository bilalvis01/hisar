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
import IconButtonFilled from "./IconButtonFilled";
import List from "../icons/List";
import { usePathname } from "next/navigation";
import style from "./navigation-drawer.module.scss";
import IconButtonStandard from "./IconButtonStandard";
import IconClose from "../icons/Close";

function useNavigationDrawer() {
    const [open, setOpen] = React.useState(false);
    const [labelId, setLabelId] = React.useState<string | undefined>();
    const [descriptionId, setDescriptionId] = React.useState<string | undefined>();

    const pathname = usePathname()
    const [prevPathname, setPrevPathname] = React.useState(pathname);

    const handleResize = React.useCallback(() => {
        if (window.innerWidth >= 992) {
            setOpen(false);
        }
    }, [setOpen]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    React.useEffect(() => {
        if (prevPathname != pathname) {
            setPrevPathname(pathname);
            setOpen(false);
        }
    }, [setOpen, setPrevPathname, pathname, prevPathname]);

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
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
            pathname,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId],
    );
}

type ContextType =
    |   (ReturnType<typeof useNavigationDrawer> & {
            setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
            setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
        })
    |   null;

const DialogContext = React.createContext<ContextType>(null);

const useNavigationDrawerContext = () => {
    const context = React.useContext(DialogContext);

    if (context == null) {
        throw new Error("Dialog components must be wrapped in <Dialog />");
    }

    return context;
}

interface NavigationDrawerProps extends React.HTMLProps<HTMLDivElement> {
    modal?: boolean,
};

export const NavigationDrawer = React.forwardRef<
    HTMLDivElement,
    NavigationDrawerProps
>(function NavigationDrawerContent({ className, ...props}, propRef) {
    const context = useNavigationDrawer();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);
    const floatingContext = context.context;

    return (
        <DialogContext.Provider value={context}>
            <nav className={clsx(style.nav, className)}>
                <IconButtonFilled onClick={() => context.setOpen(true)}>
                    <List />
                </IconButtonFilled>
                {context.open && (
                    <FloatingPortal>
                        <FloatingOverlay className="navigation-drawer" lockScroll>
                            <FloatingFocusManager context={floatingContext}>
                                <div
                                    ref={ref}
                                    aria-labelledby={context.labelId}
                                    aria-describedby={context.descriptionId}
                                    aria-modal={context.open}
                                    className="navigation-container"
                                    {...context.getFloatingProps(props)}
                                >
                                    {props.children}
                                </div>
                            </FloatingFocusManager>
                        </FloatingOverlay>
                    </FloatingPortal>
                )}
            </nav>
        </DialogContext.Provider>
    );
});

interface LinkProps extends NextLinkProps {
    children: React.ReactNode,
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    notification?: number,
};

export function Link({
    children,
    startIcon,
    endIcon,
    notification = 0,
    href,
    ...props
}: LinkProps) {
    const { pathname } = useNavigationDrawerContext();

    return (
        <li>
            <NextLink className={clsx("navigation-button", { active: pathname == href })} href={href} {...props}>
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
            </NextLink>
        </li>
    )
}

export function Header({ children, className }) {
    return (
        <div className={clsx("navigation-header", className)}>
            {children}
        </div>
    );
}

export const Close = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
    const { setOpen } = useNavigationDrawerContext();

    return (
        <IconButtonStandard type="button" {...props} ref={ref} onClick={() => setOpen(false)}>
            <IconClose />
        </IconButtonStandard>
    );
});