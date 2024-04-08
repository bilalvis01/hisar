"use client";

import React from "react";
import clsx from "clsx";

type Variant = "elevated" | "filled" | "tonal" | "outlined" | "text" | "icon"; 

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    variant?: Variant;
    focusIndicator?: boolean;
};

const ButtonBase = React.forwardRef<
    HTMLButtonElement,
    ButtonBaseProps
>(function ({ 
    children, 
    startIcon, 
    endIcon,
    variant = "filled",
    focusIndicator = true,
    className,
    ...props
}, ref) {
    return (
        <button ref={ref} className={clsx("button", variant, { "focus-indicator": focusIndicator }, className)} {...props}>
            <div className="container">
                <div className="state-layer">
                    <div className="content">
                        {startIcon}
                        <span className="label">{children}</span>
                        {endIcon}
                    </div>
                </div>
            </div>
        </button>
    )
});

export default ButtonBase;