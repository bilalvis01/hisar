"use client"

import React from "react";
import Navigation from "../Navigation";
import NavigationDrawer from "../NavigationDrawer";
import Logo from "../Logo";
import { usePathname } from "next/navigation";
import style from "./header.module.scss";

export default function Header({ className }) {
    const pathname = usePathname();

    return (
        <header className={className}>
            <NavigationDrawer select={pathname} className={style.navigationDrawer} />
            <nav className={style.logo}>
                <Logo />
            </nav>
            <Navigation select={pathname} className={style.navigation} />
        </header>
    )
}