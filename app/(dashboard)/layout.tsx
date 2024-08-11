"use client";

import React from "react";
import style from "./layout.module.scss";
import Header from "../components/header/Header";
import Snackbar from "../components/snackbar/Snackbar";
import { TemplateProvider } from "../context/TemplateProvider";
import ApolloProvider from "../context/ApolloProvider";
import { SessionProvider } from "next-auth/react";

export default function Template({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ApolloProvider>
            <SessionProvider>
                <TemplateProvider>
                    <div className={style.app}>
                        <main className={style.main}>
                            {children}
                        </main>
                        <footer className={style.footer}>
                            <span className="text-title-medium">HISAR SINAGA - 2024</span>
                        </footer>
                        <Header className={style.header} />
                    </div>
                    <Snackbar />
                </TemplateProvider>
            </SessionProvider>
        </ApolloProvider>
    )
} 