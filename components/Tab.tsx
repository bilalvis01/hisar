"use client"

import React from "react";
import Link, { LinkProps } from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

type Variant = "primary" | "secondary"; 

interface TabLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
    role?: string;
    variant?: Variant;
    active?: boolean;
}

export default function Tab({
    children,
    className,
    role,
    variant,
    href,
    ...props
}: TabLinkProps) {
    const pathname = usePathname();

    const rootClassName = clsx(
        "tab", 
        { "primary-navigation": variant === "primary"}, 
        { "secondary-navigation": variant === "secondary" }, 
        { active: href === pathname }, 
        className
    );

    return (
        <Link 
            href={href}
            role={role}
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
        </Link>
    );
}