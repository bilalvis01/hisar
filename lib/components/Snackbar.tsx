import React from "react";
import clsx from "clsx";

export function Snackbar({ children, className, ...props }: React.HTMLProps<HTMLDivElement>) {
    return (
        <div {...props} className={clsx("snackbar", className)}>
            <div className="container">
                {children}
            </div>
        </div>
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
    return (
        <div className="supporting-text">
            {children}
        </div>
    );
}