import React from "react";
import clsx from "clsx";

export function Menu({ children }: { children: React.ReactNode }) {
    return (
        <div className="menu">
            <div className="container">
                {children}
            </div>
        </div>
    );
}

interface MenuItemProps {
    children: React.ReactNode,
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    select?: boolean,
}

export function MenuItem({ 
    children, 
    startIcon, 
    endIcon,
    select = false,
}: MenuItemProps) {
    return (
        <button type="button" className={clsx("list-item", { select })}>
            <div className="decorator">
                <div className="state-layer" />
            </div>
            {startIcon && (
                <span className="leading-icon">
                    {startIcon}
                </span>
            )}
            <span className="label">
                {children}
            </span>
            {endIcon && (
                <span className="leading-icon">
                    {endIcon}
                </span>
            )}
        </button>
    );
}