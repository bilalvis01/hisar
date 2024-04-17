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
        <button {...props} ref={ref} className={clsx(`button-${variant}`, className)}>
            <div className="content">
                {startIcon}
                <span className="label">{children}</span>
                {endIcon}
            </div>
            <div className="decorator">
                <div className="base">
                    <div className="state-layer" />
                </div>
            </div>
        </button>
    )
});

export default ButtonBase;