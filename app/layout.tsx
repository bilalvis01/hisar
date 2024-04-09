import React from "react";
import "../uicomponents/components.scss";
import style from "./layout.module.scss";
import Logo from "../components/Logo";
import Navigation from "../components/Navigation";
import { NavigationDrawer, Link } from "../components/NavigationDrawer";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <div className={style.app}>
                    <header className={style.header}>
                        <NavigationDrawer>
                            <Link href={"/"}>Home</Link>
                            <Link href={"/budget"}>Budget</Link>
                            <Link href={"/expense"}>Expense</Link>
                        </NavigationDrawer>
                        <nav className={style.logo}>
                            <Logo />
                        </nav>
                        <nav className={style.mainNavigation} aria-label="Main Navigation">
                            <Navigation 
                                role="menubar" 
                                ariaLabel="Main Navigation" 
                                classes={{ root: style.mainNavigationBar, menuItem: style.mainNavigationItem }} 
                            />
                        </nav>
                    </header>
                    <main className={style.main}>
                        {children}
                    </main>
                    <footer className={style.footer}>
                        2024
                    </footer>
                </div>
            </body>
        </html>
    )
} 