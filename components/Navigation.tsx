import React from "react";
import Link from "next/link";
import clsx from "clsx";
import style from "./navigation.module.scss";

interface NavigationProps {
    role: string;
    ariaLabel: string;
    classes: { root: string, menuItem: string, };
}

export default function Navigation({ 
    role,
    ariaLabel,
    classes 
}: NavigationProps) {
    return (
        <ul className={clsx(style.navigation, classes.root)} role={role} aria-label={ariaLabel}>
            <li role="none" className={clsx("navigation-tab", "primary", "inline", "active", style.tabWidth)}>
                <Link role="menuitem" className="container" href="/">
                    <div className="state-layer">
                        <div className="content">
                            <span className="label">Home</span>
                            <hr />
                        </div>
                    </div>
                    <hr />
                </Link>
            </li>
            <li role="none" className={clsx("navigation-tab", "primary", "inline", style.tabWidth)}>
                <Link role="menuitem" className="container" href="/budget">
                    <div className="state-layer">
                        <div className="content">
                            <span className="label">Budget</span>
                            <hr />
                        </div>
                    </div>
                    <hr />
                </Link>
            </li>
            <li role="none" className={clsx("navigation-tab", "primary", "inline", style.tabWidth)}>
                <Link role="menuitem" className="container" href="/expense">
                    <div className="state-layer">
                        <div className="content">
                            <span className="label">Expense</span>
                            <hr />
                        </div>
                    </div>
                    <hr />
                </Link>
            </li>
        </ul>
    );
}