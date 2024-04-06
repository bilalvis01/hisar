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
import Close from "../icons/Close";
import List from "../icons/List";
import IconButtonStandard from "./IconButtonStandard";

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
                    <List />
                </DialogTrigger>
                <DialogContent overlay={style.overlay} className={style.dialog}>
                    <header className={style.header}>
                        <Logo className={style.logo} />
                        <IconButtonStandard className={style.close} selected>
                            <Close />
                        </IconButtonStandard>
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