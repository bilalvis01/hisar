"use client";

import React from "react";
import style from "./Template.module.scss";
import Header from "./header/Header";
import { 
    ApolloClient, 
    InMemoryCache, 
    ApolloProvider, 
    gql 
} from '@apollo/client';

const client = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache()
});

export default function Template({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ApolloProvider client={client}>
                    <div className={style.app}>
                        <main className={style.main}>
                            {children}
                        </main>
                        <footer className={style.footer}>
                            2024
                        </footer>
                        <Header className={style.header} />
                    </div>
                </ApolloProvider>
            </body>
        </html>
    )
} 