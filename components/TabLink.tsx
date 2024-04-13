"use client"

import React from "react";
import Link, { LinkProps } from "next/link";
import clsx from "clsx";
import { useTabBarContext } from "./TabBar";

interface TabLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
    role?: string;
    active?: boolean;
}

export default function TabLink({
    children,
    className,
    role,
    href,
    ...props
}: TabLinkProps) {
    const { select } = useTabBarContext();

    return (
        <Link 
            href={href}
            role={role}
            className={clsx("tab-link-navigation", { active: href === select }, className)} 
            {...props}
        >
            <div className="container">
                <div className="active-indicator">
                    <div className="state-layer">
                        <div className="content">
                            <span className="label">{children}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}