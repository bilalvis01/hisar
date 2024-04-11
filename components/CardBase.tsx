import React from "react";
import clsx from "clsx";

type Variant = "elevated" | "filled" | "outlined";

export interface CardBaseProps {
    children: React.ReactNode;
    className?: string;
    variant?: Variant; 
}

export default function CardBase({ 
    children,
    className,
    variant = "filled",
}: CardBaseProps) {
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