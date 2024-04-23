import React from "react";
import "../uicomponents/components.scss";
import Template from "../lib/tamplates/Template";

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({
    children,
}: RootLayoutProps) {
    return (
        <Template>{children}</Template>   
    );
} 