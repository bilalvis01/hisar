import React from "react";
import style from "./Navigation.module.scss";
import TabLink from "../../components/TabLink";
import TabBar from "../../components/TabBar";
import Link from "next/link";

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
                        <Link href="/" passHref legacyBehavior>
                            <TabLink className={style.tab}>Home</TabLink>
                        </Link>
                    </li>
                    <li role="none">
                        <Link href="/budget" passHref legacyBehavior>
                            <TabLink className={style.tab}>Budget</TabLink>
                        </Link>
                    </li>
                    <li role="none">
                        <Link href="/expense" passHref legacyBehavior>
                            <TabLink className={style.tab}>Expense</TabLink>
                        </Link>
                    </li>
                </ul>
            </TabBar>
        </nav>
    );
}