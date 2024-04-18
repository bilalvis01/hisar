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
    const [windowSize, setWindowSize] = React.useState(window.innerWidth >= 840 ? "large" : "medium");

    const handleResize = React.useCallback(() => {
        if (window.innerWidth >= 840) setWindowSize("large");
        else setWindowSize("medium");
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    });

    return (
        <TopAppBarSmall className={clsx("color-primary", className)}>
            {windowSize === "large"
                ? (
                    <>
                        <Brand className={style.brandOnLargeWindow}>
                            <Link href="/">
                                <Logo />
                            </Link>
                            <Link href="/">
                                <Headline>HISAR</Headline>
                            </Link>
                        </Brand>
                        <Navigation className={style.navigation} />
                    </>
                )
                : (
                    <>
                        <NavigationDrawer />
                        <Brand>
                            <Link href="/">
                                <Logo />
                            </Link>
                        </Brand>
                    </>
                )
            }
        </TopAppBarSmall>
    )
}