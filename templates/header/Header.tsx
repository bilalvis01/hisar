"use client"

import React from "react";
import Navigation from "../navigation/Navigation";
import Logo from "../logo/Logo";
import style from "./Header.module.scss";
import { TopAppBarSmall, Headline, Brand } from "../../components/TopAppBarSmall";
import clsx from "clsx";
import Link from "next/link";
import NavigationDrawer from "../navigation-drawer/NavigationDrawer";

export default function Header({ className }) {
    return (
        <>
            <TopAppBarSmall className={clsx(style.colorPrimary, style.largeWindowAppBar, className)}>
                <Brand className={style.largeWindowBrand}>
                    <Link href="/">
                        <Logo />
                    </Link>
                    <Link href="/">
                        <Headline>HISAR</Headline>
                    </Link>
                </Brand>
                <Navigation className={style.navigation} />
            </TopAppBarSmall>
            <TopAppBarSmall className={clsx(style.appBar, style.important, style.mediumWindowAppBar, className)}>
                <NavigationDrawer />
                <Brand>
                    <Link href="/">
                        <Logo />
                    </Link>
                </Brand>
            </TopAppBarSmall>
        </>
    )
}