"use client"

import React from "react";
import Navigation from "../navigation/Navigation";
import Logo from "../logo/Logo";
import style from "./Header.module.scss";
import { TopAppBarSmall, Headline, Brand } from "../../components/TopAppBarSmall";
import clsx from "clsx";
import Link from "next/link";
import NavigationDrawer from "../navigation-drawer/NavigationDrawer";
import { useTemplateContext } from "../Template";

export default function Header({ className }) {
    const { 
        toolbarRef, 
        toolbarSecondaryRef, 
        headlineSecondaryRef,
        showCompactScreenAppBarSecondary,
        screen,
    } = useTemplateContext();

    return (
        <>
            <TopAppBarSmall 
                className={clsx(style.colorPrimary, className)}
                style={{ display: screen === "expanded" ? "block" : "none" }}
            >
                <Brand className={style.brand}>
                    <Link href="/">
                        <Logo />
                    </Link>
                    <Link href="/">
                        <Headline>HISAR</Headline>
                    </Link>
                </Brand>
                <Navigation className={style.navigation} />
            </TopAppBarSmall>
            <TopAppBarSmall 
                className={clsx(style.colorPrimary, className)}
                style={{ 
                    display: !showCompactScreenAppBarSecondary && ["compact", "medium"].includes(screen) 
                        ? "block"
                        : "none" 
                }}
            >
                <NavigationDrawer />
                <Brand className={style.brand}>
                    <Link href="/">
                        <Logo />
                    </Link>
                </Brand>
                <div ref={toolbarRef} />
            </TopAppBarSmall>
            <TopAppBarSmall 
                className={style.colorPrimary}
                style={{ 
                    display: showCompactScreenAppBarSecondary && ["compact", "medium"].includes(screen) 
                        ? "block"
                        : "none" 
                }}
            >
                <NavigationDrawer />
                <Headline ref={headlineSecondaryRef} className={style.brand} />
                <div ref={toolbarSecondaryRef} />
            </TopAppBarSmall>
        </>
    )
}