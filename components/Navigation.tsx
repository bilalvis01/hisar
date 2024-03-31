import React from "react";
import Link from "next/link";

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
        <ul className={classes.root} role={role} aria-label={ariaLabel}>
            <li role="none">
                <Link role="menuitem" className={classes.menuItem} href="/">Home</Link>
            </li>
            <li role="none">
                <Link role="menuitem" className={classes.menuItem} href="/budget">Budget</Link>
            </li>
            <li role="none">
                <Link role="menuitem" className={classes.menuItem} href="/expanse">Expanse</Link>
            </li>
        </ul>
    );
}