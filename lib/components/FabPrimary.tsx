import React from "react";
import clsx from "clsx";

export default function FabPrimary({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button {...props} className={clsx("fab-primary", className)}>
            <div className="container">
                <div className="decorator">
                    <div className="state-layer" />
                </div>
                {children}
            </div>
        </button>
    )
}