import React from "react";
import clsx from "clsx";

type Variant = "filled" | "tonal" | "outlined" | "standard";

interface IconButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    toggleButton?: boolean;
    selected?: boolean;
}

export default function IconButtonBase({ 
    children, 
    className, 
    variant = "standard", 
    toggleButton = false,
    selected = false, 
    ...props
}: IconButtonBaseProps) {
    return (
        <button 
            className={clsx("icon-button", variant, { "toggle-button": toggleButton, selected: selected }, className)}
            {...props}
        >
            <div className="container">
                <div className="state-layer">
                    {children}
                </div>
            </div>
        </button>
    );
}