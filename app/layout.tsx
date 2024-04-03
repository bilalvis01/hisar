import React from "react";
import "../style/style.scss";
import style from "./layout.module.scss";
import Logo from "../components/Logo";
import Navigation from "../components/Navigation";
import DrawerNavigation from "../components/DrawerNavigation";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <div className={style.app}>
                    <header className={style.header}>
                        <DrawerNavigation />
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