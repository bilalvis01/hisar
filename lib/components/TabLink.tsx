"use client"

import React from "react";
import clsx from "clsx";
import { useTabBarContext } from "./TabBar";

const TabLink = React.forwardRef<
    HTMLAnchorElement,
    React.HTMLProps<HTMLAnchorElement>
>(function TabLink({
    children,
    className,
    href,
    ...props
}, ref) {
    const { select } = useTabBarContext();

    return (
        <li>
            <a
                {...props}
                ref={ref}
                href={href}
                className={clsx("tab-link-navigation", { active: href === select }, className)} 
            >
                <span className="container">
                    <div className="decorator">
                        <div className="active-indicator">
                            <div className="state-layer" />
                        </div>
                    </div>
                    <span className="label">{children}</span>
                </span>
            </a>
        </li>
    );
});

export default TabLink;