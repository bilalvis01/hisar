"use client";

import React from "react";
import clsx from "clsx";
import ProgressCircular from "./ProgressCircular";

type Variant = "elevated" | "filled" | "tonal" | "outlined" | "text" | "icon"; 

export interface CommonButtonProps {
    children: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    progress?: boolean;
    variant?: Variant;
};

const ButtonContent = ({ 
    progress,
    startIcon,
    endIcon,
    children 
}: CommonButtonProps) => {
    return (
        <div className="container">
            <div className="decorator">
                <div className="base">
                    <div className="state-layer" />
                </div>
            </div>
            {progress 
                ? <span className="progress"><ProgressCircular size="sm" /></span>
                : startIcon
                ? <span className="icon">{startIcon}</span>
                : null}
            <span className="label">{children}</span>
            {endIcon ? <span className="icon">{endIcon}</span> : null }
        </div>
    );
};

export type ButtonBaseProps = CommonButtonProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const ButtonBase = React.forwardRef<
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
            <ButtonContent 
                startIcon={startIcon} 
                endIcon={endIcon}
                progress={progress}
            >
                {children}
            </ButtonContent>
        </button>
    )
});

export type LinkBaseProps = CommonButtonProps & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export const LinkBase = React.forwardRef<
    HTMLAnchorElement,
    LinkBaseProps
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
        <a {...props} ref={ref} className={clsx(`button-${variant}`, className)}>
            <ButtonContent 
                startIcon={startIcon} 
                endIcon={endIcon}
                progress={progress}
            >
                {children}
            </ButtonContent>
        </a>
    )
});