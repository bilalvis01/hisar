import React from "react";
import { 
    NavigationDrawer as NavigationDrawerBase, 
    Link as NavigationDrawerLink, 
    Header as NavigationDrawerHeader,
    Close as NavigationDrawerClose, 
} from "../../components/NavigationDrawer";
import Logo from "../../templates/Logo";
import style from "./navigation-drawer.module.scss";

interface NavigationDrawerProps {
    className?: string,
}

export default function NavigationDrawer({ className }: NavigationDrawerProps) {
    return (
        <NavigationDrawerBase className={className}>
            <NavigationDrawerHeader className={style.header}>
                <Logo />
                <NavigationDrawerClose />
            </NavigationDrawerHeader>
            <hr />
            <ul>
                <li>
                    <NavigationDrawerLink href={"/"}>Home</NavigationDrawerLink>
                </li>
                <li>
                    <NavigationDrawerLink href={"/budget"}>Budget</NavigationDrawerLink>
                </li>
                <li>
                    <NavigationDrawerLink href={"/expense"}>Expense</NavigationDrawerLink>
                </li>
            </ul>
        </NavigationDrawerBase>
    );
}