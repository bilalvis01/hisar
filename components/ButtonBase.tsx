import React from "react";
import clsx from "clsx";

export interface Variant {
    solid: string;
    outlined: string;
}

export interface Color {
    primary: string;
    secondary: string;
}

export interface Size {
    sm: string;
    md: string;
    lg: string;
}

export interface Classes {
    root: string;
    variant: Variant;
    color: Color;
    size: Size;
}

export type VariantKey = keyof Variant;

export type ColorKey = keyof Color;

export type SizeKey = keyof Size;

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: VariantKey;
    color?: ColorKey;
    size?: SizeKey;
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
                classes.root,
                classes.variant[variant],
                classes.color[color],
                classes.size[size],
            )}
            {...props}
        >
            {children}
        </button>
    );
}