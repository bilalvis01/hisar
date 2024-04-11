"use client"

import React from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

type Variant = "primary" | "secondary"; 

export interface TabBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: Variant;
    active?: boolean;
}

export default function TabBase({
    children,
    className,
    variant,
    ...props
}: TabBaseProps) {
    const pathname = usePathname();

    const rootClassName = clsx(
        "tab", 
        { "primary-navigation": variant === "primary"}, 
        { "secondary-navigation": variant === "secondary" },
        className
    );

    return (
        <button 
            className={rootClassName} 
            {...props}
        >
            <div className="container">
                <div className="state-layer">
                    <div className="content">
                        <span className="label">{children}</span>
                        <hr />
                    </div>
                </div>
                <hr />
            </div>
        </button>
    );
}