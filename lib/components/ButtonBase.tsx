"use client";

import React from "react";
import clsx from "clsx";

type Variant = "elevated" | "filled" | "tonal" | "outlined" | "text" | "icon"; 

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    progress?: React.ReactNode;
    variant?: Variant;
};

const ButtonBase = React.forwardRef<
    HTMLButtonElement,
    ButtonBaseProps
>(function ({ 
    children, 
    startIcon, 
    endIcon,
    progress,
    variant = "filled",
    className,
    ...props
}, ref) {
    return (
        <button {...props} ref={ref} className={clsx(`button-${variant}`, className)}>
            <div className="container">
                <div className="decorator">
                    <div className="base">
                        <div className="state-layer" />
                    </div>
                </div>
                {progress 
                    ? <span className="progress">{progress}</span>
                    : startIcon
                    ? <span className="icon">{startIcon}</span>
                    : null}
                <span className="label">{children}</span>
                {endIcon ? <span className="icon">{endIcon}</span> : null }
            </div>
        </button>
    )
});

export default ButtonBase;