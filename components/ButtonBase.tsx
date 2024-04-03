import React from "react";
import clsx from "clsx";

export interface Classes {
    button?: string;
    plain?: string;
    solid?: string;
    outlined?: string;
    soft?: string;
    primary?: string;
    secondary?: string;
    sm?: string;
    md?: string;
    lg?: string;
}

export type Variant = "plain" | "solid" | "outlined" | "soft";

export type Color = "primary" | "secondary";

export type Size = "sm" | "md" | "lg";

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    color?: Color;
    size?: Size;
    classes?: Classes;
}

export default function ButtonBase({ 
    children,
    variant = "solid",
    color = "primary",
    size = "md",
    classes,
    ...props
}: ButtonBaseProps) {
    return (
        <button 
            className={clsx(
                classes.button,
                classes[variant],
                classes[color],
                classes[size],
            )}
            {...props}
        >
            {children}
        </button>
    );
}