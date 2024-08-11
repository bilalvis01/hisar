"use client"

import React from "react";
import { 
    NavigationDrawer as NavigationDrawerBase, 
    NavigationBody,
    NavigationLink, 
    NavigationHeader, 
    NavigationHeadline,
} from "../../../ui/react/NavigationDrawer";
import { IconButtonFilled } from "../../../ui/react/IconButtonFilled";
import { IconButtonStandard } from "../../../ui/react/IconButtonStandard";
import IconX from "../../../lib/icons/X";
import IconList from "../../../lib/icons/List";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

interface NavigationDrawerProps {
    className?: string,
    iconButtonStandard?: boolean,
}

export default function NavigationDrawer({ className, iconButtonStandard = false }: NavigationDrawerProps) {
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
            {!iconButtonStandard && (
                <IconButtonFilled onClick={() => setOpen(true)}>
                    <IconList />
                </IconButtonFilled>
            )}
            {iconButtonStandard && (
                <IconButtonStandard onClick={() => setOpen(true)}>
                    <IconList />
                </IconButtonStandard>
            )}
            <NavigationDrawerBase 
                variant="modal"
                open={open}
                onOpenChange={setOpen}
                select={pathname}
            >
                <NavigationHeader>
                    <NavigationHeadline>HISAR</NavigationHeadline>
                    <IconButtonStandard onClick={() => setOpen(false)}>
                        <IconX />
                    </IconButtonStandard>
                </NavigationHeader>
                <NavigationBody>
                    <NextLink href={"/beranda"} passHref legacyBehavior>
                        <NavigationLink>Beranda</NavigationLink>
                    </NextLink>
                    <NextLink href={"/anggaran"} passHref legacyBehavior>
                        <NavigationLink>Anggaran</NavigationLink>
                    </NextLink>
                    <NextLink href={"/biaya-biaya"} passHref legacyBehavior>
                        <NavigationLink>Biaya-biaya</NavigationLink>
                    </NextLink>
                </NavigationBody>
            </NavigationDrawerBase>
        </nav>
    );
}