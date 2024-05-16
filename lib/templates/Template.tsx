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
import Snackbar from "./snackbar/Snackbar";

const client = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache()
});

export type Screen = "compact" | "medium" | "expanded";

interface TemplateContext {
    toolbarRef: React.RefObject<HTMLDivElement>;
    screen: Screen;
    info: string;
    setInfo: React.Dispatch<React.SetStateAction<string | null>>;
    snackbarStyle: React.CSSProperties;
    setSnackbarStyle: React.Dispatch<React.SetStateAction<React.CSSProperties | null>>;
}

const TemplateContext = React.createContext<TemplateContext>(null);

export function useTemplateContext() {
    return React.useContext(TemplateContext);
}

function useTemplate(): TemplateContext {
    const toolbarRef = React.useRef(null);
    const [screen, setScreen] = React.useState<Screen>("compact");
    const [info, setInfo] = React.useState<string | null>(null);
    const [snackbarStyle, setSnackbarStyle] = React.useState<React.CSSProperties | null>(null);

    const handleScreen = React.useCallback(() => {
        if (window.innerWidth < 600) setScreen("compact");
        else if (window.innerWidth < 840) setScreen("medium");
        else setScreen("expanded");
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", handleScreen);

        return () => window.removeEventListener("resize", handleScreen);
    });

    React.useEffect(() => {
        handleScreen();
    }, []);

    return React.useMemo(() => ({
        toolbarRef,
        screen,
        info,
        setInfo,
        snackbarStyle,
        setSnackbarStyle,
    }), [
        screen,
        info,
        snackbarStyle,
    ]);
}

export default function Template({
    children,
}: {
    children: React.ReactNode
}) {
    const templateContext = useTemplate();

    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ApolloProvider client={client}>
                    <TemplateContext.Provider value={templateContext}>
                        <div className={style.app}>
                            <main className={style.main}>
                                {children}
                            </main>
                            <footer className={style.footer}>
                                2024
                            </footer>
                            <Header className={style.header} />
                        </div>
                    </TemplateContext.Provider>
                </ApolloProvider>
                <Snackbar 
                    open={!!templateContext.info} 
                    onClose={() => templateContext.setInfo(null)}
                    style={templateContext.snackbarStyle}
                >
                    {templateContext.info}
                </Snackbar>
            </body>
        </html>
    )
} 