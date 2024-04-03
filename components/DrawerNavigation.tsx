"use client";

import React from "react";
import style from "./drawer-navigation.module.scss";
import {
    Dialog,
    DialogHeading,
    DialogContent,
    DialogDescription,
    DialogTrigger,
    DialogClose,
} from "../components/Dialog";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Navigation from "./Navigation";

export default function DialogNavigation() {
    const [open, setOpen] = React.useState(false);

    const pathname = usePathname()
    const [prevPathname, setPrevPathname] = React.useState(pathname);

    const handleResize = React.useCallback(() => {
        if (window.innerWidth >= 992) {
            setOpen(false);
        }
    }, [setOpen]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    React.useEffect(() => {
        if (prevPathname != pathname) {
            setPrevPathname(pathname);
            setOpen(false);
        }
    }, [setOpen, setPrevPathname, pathname, prevPathname]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <nav aria-label="Dialog Navigation" className={style.nav}>
                <DialogTrigger className={style.trigger}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </DialogTrigger>
                <DialogContent overlay={style.overlay} className={style.dialog}>
                    <header className={style.header}>
                        <Logo className={style.logo} />
                        <DialogClose className={style.close}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                            </svg>
                        </DialogClose>
                    </header>
                    <div>
                        <Navigation 
                            role="menu" 
                            ariaLabel="Dialog Navigation" 
                            classes={{ root: style.navigationBar, menuItem: style.navigationItem }} 
                        />
                    </div>
                </DialogContent>
            </nav>
        </Dialog>
    );
}