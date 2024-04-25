"use client"

import React from "react";
import { 
    NavigationDrawer as NavigationDrawerBase, 
    NavigationBody,
    NavigationLink, 
    NavigationHeader, 
    NavigationHeadline,
} from "../../components/navigation-drawer/NavigationDrawer";
import IconButtonFilled from "../../components/IconButtonFilled";
import IconButtonStandard from "../../components/IconButtonStandard";
import IconClose from "../../icons/Close";
import IconList from "../../icons/List";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

interface NavigationDrawerProps {
    className?: string,
}

export default function NavigationDrawer({ className }: NavigationDrawerProps) {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();

    const handleResize = React.useCallback(() => {
        if (window.innerWidth >= 840) {
            setOpen(false);
        }
    }, [setOpen]);

    React.useEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    React.useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <nav className={className}>
            <IconButtonFilled onClick={() => setOpen(true)}>
                <IconList />
            </IconButtonFilled>
            <NavigationDrawerBase 
                variant="modal"
                open={open}
                onOpenChange={setOpen}
                select={pathname}
            >
                <NavigationHeader>
                    <NavigationHeadline>HISAR</NavigationHeadline>
                    <IconButtonStandard onClick={() => setOpen(false)}>
                        <IconClose />
                    </IconButtonStandard>
                </NavigationHeader>
                <NavigationBody>
                    <ul>
                        <li>
                            <NextLink href={"/"} passHref legacyBehavior>
                                <NavigationLink>Home</NavigationLink>
                            </NextLink>
                        </li>
                        <li>
                            <NextLink href={"/budget"} passHref legacyBehavior>
                                <NavigationLink>Budget</NavigationLink>
                            </NextLink>
                        </li>
                        <li>
                            <NextLink href={"/expense"} passHref legacyBehavior>
                                <NavigationLink>Expense</NavigationLink>
                            </NextLink>
                        </li>
                    </ul>
                </NavigationBody>
            </NavigationDrawerBase>
        </nav>
    );
}