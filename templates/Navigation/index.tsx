import React from "react";
import style from "./navigation.module.scss";
import TabLink from "../../components/TabLink";
import TabBar from "../../components/TabBar";

interface NavigationProps {
    className?: string;
    select?: string;
}

export default function Navigation({ 
    className,
    select,
}: NavigationProps) {
    return (
        <nav className={className} aria-label="Main Navigation">
            <TabBar select={select}>
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
            </TabBar>
        </nav>
    );
}