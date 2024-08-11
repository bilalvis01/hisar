"use client"

import React from "react";
import clsx from "clsx";
import { useTabBarContext } from "./TabBar";

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
    const { select } = useTabBarContext();

    return (
        <li>
            <button 
                className={clsx(`tab-${variant}-navigation`, className)} 
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
        </li>
    );
}