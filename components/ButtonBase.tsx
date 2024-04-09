"use client";

import React from "react";
import clsx from "clsx";

type Variant = "elevated" | "filled" | "tonal" | "outlined" | "text" | "icon"; 

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    variant?: Variant;
};

const ButtonBase = React.forwardRef<
    HTMLButtonElement,
    ButtonBaseProps
>(function ({ 
    children, 
    startIcon, 
    endIcon,
    variant = "filled",
    className,
    ...props
}, ref) {
    return (
        <button ref={ref} className={clsx("button", variant, className)} {...props}>
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