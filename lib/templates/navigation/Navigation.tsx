import React from "react";
import style from "./Navigation.module.scss";
import TabLink from "../../components/TabLink";
import TabBar from "../../components/TabBar";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
    className?: string;
}

export default function Navigation({ className }: NavigationProps) {
    const pathname = usePathname();

    return (
        <nav className={className} aria-label="Main Navigation">
            <TabBar select={pathname}>
                <Link href="/" passHref legacyBehavior>
                    <TabLink className={style.tab}>Home</TabLink>
                </Link>
                <Link href="/budget" passHref legacyBehavior>
                    <TabLink className={style.tab}>Budget</TabLink>
                </Link>
                <Link href="/expense" passHref legacyBehavior>
                    <TabLink className={style.tab}>Expense</TabLink>
                </Link>
            </TabBar>
        </nav>
    );
}