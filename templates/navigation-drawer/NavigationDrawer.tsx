"use client"

import React from "react";
import { 
    NavigationDrawer as NavigationDrawerBase, 
    NavigationDrawerContent,
    NavigationBody,
    NavigationLink, 
    NavigationHeader, 
    NavigationHeadline,
} from "../../components/navigation-drawer/NavigationDrawer";
import IconButtonFilled from "../../components/IconButtonFilled";
import IconButtonStandard from "../../components/IconButtonStandard";
import IconClose from "../../icons/Close";
import IconList from "../../icons/List";

interface NavigationDrawerProps {
    className?: string,
    select?: string,
}

export default function NavigationDrawer({ className, select }: NavigationDrawerProps) {
    const [open, setOpen] = React.useState(false);

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
        setOpen(false);
    }, [select]);

    return (
        <nav className={className}>
            <NavigationDrawerBase 
                variant="modal"
                open={open}
                onOpenChange={setOpen}
                select={select}
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
                    <NavigationBody>
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
                    </NavigationBody>
                </NavigationDrawerContent>
            </NavigationDrawerBase>
        </nav>
    );
}