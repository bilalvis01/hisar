"use client"

import React from "react";
import Navigation from "../navigation/Navigation";
import NavigationDrawer from "../navigation-drawer/NavigationDrawer";
import Logo from "../logo/Logo";
import { usePathname } from "next/navigation";
import style from "./Header.module.scss";

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