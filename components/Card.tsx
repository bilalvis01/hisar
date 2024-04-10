import React from "react";
import clsx from "clsx";

type Variant = "elevated" | "filled" | "outlined";

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: Variant; 
}

export default function Card({ 
    children,
    className,
    variant = "filled",
}: CardProps) {
    return (
        <div className={clsx("card", variant)}>
            <div className="container">
                <div className="state-layer">
                    <div className={clsx("content", className)}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}