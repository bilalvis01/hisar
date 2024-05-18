import React from "react";
import clsx from "clsx";

type Variant = "filled" | "tonal" | "outlined" | "standard";

export interface IconButtonBaseProps {
    variant?: Variant;
    toggle?: boolean;
    selected?: boolean;
}

export const IconButtonBase = React.forwardRef<
    HTMLButtonElement,
    IconButtonBaseProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(function IconButtonBase({ 
    children, 
    className, 
    variant = "standard", 
    toggle = false,
    selected = false, 
    ...props
}, ref) {
    return (
        <button 
            {...props}
            ref={ref}
            className={clsx(`icon-button-${variant}`, { "toggle-button": toggle, "selected": selected }, className)}
        >
            <div className="container">
                <div className="decorator">
                    <div className="base">
                        <div className="state-layer" />
                    </div>
                </div>
                {children}
            </div>
        </button>
    );
})

export const IconLinkBase = React.forwardRef<
    HTMLAnchorElement,
    IconButtonBaseProps & React.HTMLProps<HTMLAnchorElement>
>(function IconLinkBase({ 
    children, 
    className, 
    variant = "standard", 
    toggle = false,
    selected = false, 
    ...props
}, ref) {
    return (
        <a
            className={clsx(`icon-button-${variant}`, { "toggle-button": toggle, "selected": selected }, className)}
            {...props}
        >
            <div className="container">
                <div className="decorator">
                    <div className="base">
                        <div className="state-layer" />
                    </div>
                </div>
                {children}
            </div>
        </a>
    );
});