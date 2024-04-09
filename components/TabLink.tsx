"use client"

import React from "react";
import Link, { LinkProps } from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

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
    const pathname = usePathname();

    return (
        <Link 
            href={href}
            role={role}
            className={clsx("tab", "link-navigation", { active: href === pathname }, className)} 
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