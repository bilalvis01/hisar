import React from "react";
import "../uicomponents/components.scss";
import Template from "../templates/Template";
import "../uicomponents/components.scss";

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