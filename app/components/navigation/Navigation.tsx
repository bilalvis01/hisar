import React from "react";
import style from "./Navigation.module.scss";
import TabLink from "../../../ui/react/TabLink";
import TabBar from "../../../ui/react/TabBar";
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
                <Link href="/beranda" passHref legacyBehavior>
                    <TabLink className={style.tab}>Beranda</TabLink>
                </Link>
                <Link href="/anggaran" passHref legacyBehavior>
                    <TabLink className={style.tab}>Anggaran</TabLink>
                </Link>
                <Link href="/biaya-biaya" passHref legacyBehavior>
                    <TabLink className={style.tab}>Biaya-biaya</TabLink>
                </Link>
            </TabBar>
        </nav>
    );
}