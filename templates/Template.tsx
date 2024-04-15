import React from "react";
import style from "./template.module.scss";
import Header from "./header/Header";

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
                <div className={style.app}>
                    <Header className={style.header} />
                    <main className={style.main}>
                        {children}
                    </main>
                    <footer className={style.footer}>
                        2024
                    </footer>
                </div>
            </body>
        </html>
    )
} 