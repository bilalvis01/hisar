import React from "react";
import clsx from "clsx";

const FabPrimary = React.forwardRef<
    HTMLButtonElement,
    React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(function FabPrimary({ children, className, ...props }, ref) {
    return (
        <button {...props} ref={ref} className={clsx("fab-primary", className)}>
            <div className="container">
                <div className="decorator">
                    <div className="state-layer" />
                </div>
                {children}
            </div>
        </button>
    )
});

export default FabPrimary;