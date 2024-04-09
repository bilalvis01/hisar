import React from "react";
import clsx from "clsx";
import style from "./navigation.module.scss";
import TabLink from "../../components/TabLink";

interface NavigationProps {
    className?: string;
}

export default function Navigation({ 
    className,
}: NavigationProps) {
    return (
        <nav className={className} aria-label="Main Navigation">
            <ul className={style.list} role="navigation" aria-label="Main Navigation">
                <li role="none">
                    <TabLink href="/" className={style.tabWidth}>Home</TabLink>
                </li>
                <li role="none">
                    <TabLink href="/budget" className={style.tabWidth}>Budget</TabLink>
                </li>
                <li role="none">
                    <TabLink href="/expense" className={style.tabWidth}>Expense</TabLink>
                </li>
            </ul>
        </nav>
    );
}