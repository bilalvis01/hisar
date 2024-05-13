import React from "react";
import "../style/style.scss";
import Template from "../lib/templates/Template";

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