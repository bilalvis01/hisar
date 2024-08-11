"use client";

import React from "react";
import clsx from "clsx";

interface SnackbarContext {
    twoLines: boolean;
    setTwoLines: React.Dispatch<React.SetStateAction<boolean>>;
}

const SnackbarContext = React.createContext<SnackbarContext>(null);

function useSnackbarContext() {
    const context = React.useContext(SnackbarContext);

    if (context == null) {
        throw new Error("Snackbar components must be wrapped in <Snackbar />");
    }

    return context;
}

function useSnackbar() {
    const [twoLines, setTwoLines] = React.useState(false);

    return React.useMemo(() => ({
        twoLines,
        setTwoLines,
    }), [twoLines]);
}

export function Snackbar({ children, className, ...props }: React.HTMLProps<HTMLDivElement>) {
    const context = useSnackbar();

    return (
        <SnackbarContext.Provider value={context}>
            <div 
                {...props} 
                className={clsx("snackbar", { "two-lines": context.twoLines }, className)}
            >
                <div className="container">
                    {children}
                </div>
            </div>
        </SnackbarContext.Provider>
    );
}

export function Action({ children, ...props }: React.HTMLProps<HTMLButtonElement>) {
    return (
        <button {...props} type="button" className="action">
            <div className="label">
                {children}
            </div>
        </button>
    );
}

export function IconAction({ children, ...props }: React.HTMLProps<HTMLButtonElement>) {
    return (
        <button {...props} type="button" className="icon-action">
            <div className="icon">
                {children}
            </div>
        </button>
    );
}

export function SupportingText({ children }: { children: React.ReactNode }) {
    const { setTwoLines } = useSnackbarContext();
    const ref = React.useRef(null);

    React.useEffect(() => {
        if (ref.current instanceof HTMLDivElement) {
            if (ref.current.clientWidth < ref.current.scrollWidth) {
                setTwoLines(true);
            }
        }
    });

    return (
        <div 
            ref={ref} 
            className="supporting-text"
        >
            {children}
        </div>
    );
}