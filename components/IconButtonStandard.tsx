import React from "react";
import clsx from "clsx";

type Variant = "filled" | "tonal" | "outlined" | "standard";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    selected?: boolean;
}

export default function IconButtonStandard({ 
    children, 
    className, 
    variant = "standard", 
    selected, 
}: IconButtonProps) {
    return (
        <button className={clsx("icon-button", variant, { selected: selected }, className)}>
            <div className="container">
                <div className="state-layer">
                    {children}
                </div>
            </div>
        </button>
    );
}