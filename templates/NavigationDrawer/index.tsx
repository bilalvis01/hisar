"use client"

import React from "react";
import { 
    NavigationDrawer as NavigationDrawerBase, 
    NavigationDrawerContent,
    NavigationDrawerBody,
    NavigationLink, 
    NavigationHeader, 
    NavigationHeadline,
} from "../../components/NavigationDrawer";
import { usePathname } from "next/navigation";
import IconButtonFilled from "../../components/IconButtonFilled";
import IconButtonStandard from "../../components/IconButtonStandard";
import IconClose from "../../icons/Close";
import IconList from "../../icons/List";

interface NavigationDrawerProps {
    className?: string,
}

export default function NavigationDrawer({ className }: NavigationDrawerProps) {
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
        <nav className={className}>
            <NavigationDrawerBase 
                variant="modal"
                open={open}
                onOpenChange={setOpen}
                select={pathname}
            >
                <IconButtonFilled onClick={() => setOpen(true)}>
                    <IconList />
                </IconButtonFilled>
                <NavigationDrawerContent>
                    <NavigationHeader>
                        <NavigationHeadline>HISAR</NavigationHeadline>
                        <IconButtonStandard onClick={() => setOpen(false)}>
                            <IconClose />
                        </IconButtonStandard>
                    </NavigationHeader>
                    <NavigationDrawerBody>
                        <ul>
                            <li>
                                <NavigationLink href={"/"}>Home</NavigationLink>
                            </li>
                            <li>
                                <NavigationLink href={"/budget"}>Budget</NavigationLink>
                            </li>
                            <li>
                                <NavigationLink href={"/expense"}>Expense</NavigationLink>
                            </li>
                        </ul>
                    </NavigationDrawerBody>
                </NavigationDrawerContent>
            </NavigationDrawerBase>
        </nav>
    );
}