import React from "react";
import "./global.scss";
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