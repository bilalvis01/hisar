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
import { usePathname } from "next/navigation";

const client = new ApolloClient({
    uri: "/api/graphql",
    cache: new InMemoryCache()
});

export type WindowSize = "compact" | "medium" | "expanded";

interface TemplateContext {
    toolbarRef: React.RefObject<HTMLDivElement>;
    toolbarSecondaryRef: React.RefObject<HTMLDivElement>;
    headlineSecondaryRef: React.RefObject<HTMLDivElement>;
    windowSize: WindowSize;
    info: string;
    setInfo: React.Dispatch<React.SetStateAction<string | null>>;
    snackbarStyle: React.CSSProperties;
    setSnackbarStyle: React.Dispatch<React.SetStateAction<React.CSSProperties | null>>;
    showCompactWindowSizeAppBarSecondary: boolean;
    setShowCompactWindowSizeAppBarSecondary: React.Dispatch<React.SetStateAction<boolean>>;
    addClickCloseAppBarSecondaryEventListener: (listener?: React.MouseEventHandler<HTMLButtonElement>) => void;
    onClickCloseAppBarSecondary: React.MouseEventHandler<HTMLButtonElement> | null;
    removeClickCloseAppBarSecondaryEventListener: () => void;
    isWindowSizeCompact: () => boolean;
    isWindowSizeMedium: () => boolean;
    isWindowSizeSpanMedium: () => boolean;
    isWindowSizeExpanded: () => boolean;
    isWindowSizeSpanExpanded: () => boolean;
}

const TemplateContext = React.createContext<TemplateContext>(null);

export function useTemplateContext() {
    return React.useContext(TemplateContext);
}

function useTemplate(): TemplateContext {
    const toolbarRef = React.useRef(null);
    const toolbarSecondaryRef = React.useRef(null);
    const headlineSecondaryRef = React.useRef(null);
    const [windowSize, setWindowSize] = React.useState<WindowSize>("compact");
    const [info, setInfo] = React.useState<string | null>(null);
    const [snackbarStyle, setSnackbarStyle] = React.useState<React.CSSProperties | null>(null);
    const [showCompactWindowSizeAppBarSecondary, setShowCompactWindowSizeAppBarSecondary] = React.useState(false);
    const pathname = usePathname()
    const [prevPathname, setPrevPathname] = React.useState(pathname);
    const [handleClickCloseAppBarSecondary, setHandleClickCloseAppBarSecondary] = 
        React.useState<React.MouseEventHandler<HTMLButtonElement> | null>(null);

    const isWindowSizeCompact = React.useCallback(() => {
        return windowSize === "compact";
    }, [windowSize]);

    const isWindowSizeMedium = React.useCallback(() => {
        return windowSize === "medium";
    }, [windowSize]);

    const isWindowSizeSpanMedium = React.useCallback(() => {
        return ["compact", "medium"].includes(windowSize);
    }, [windowSize]);

    const isWindowSizeExpanded = React.useCallback(() => {
        return windowSize === "expanded";
    }, [windowSize]);

    const isWindowSizeSpanExpanded = React.useCallback(() => {
        return ["compact", "medium", "expanded"].includes(windowSize);
    }, [windowSize]);

    const addClickCloseAppBarSecondaryEventListener = React.useCallback(
        (listener: React.MouseEventHandler<HTMLButtonElement>) => {
            setHandleClickCloseAppBarSecondary(() => listener);
        }, 
        []
    );

    const removeClickCloseAppBarSecondaryEventListener = React.useCallback(() => {
        setHandleClickCloseAppBarSecondary(null);
    }, []);

    const handleWindowSize = React.useCallback(() => {
        if (window.innerWidth < 600) setWindowSize("compact");
        else if (window.innerWidth < 840) setWindowSize("medium");
        else setWindowSize("expanded");
    }, []);

    React.useEffect(() => {
        window.addEventListener("resize", handleWindowSize);

        return () => window.removeEventListener("resize", handleWindowSize);
    });

    React.useEffect(() => {
        handleWindowSize();
    }, []);

    React.useEffect(() => {
        if (prevPathname !== pathname) {
            setShowCompactWindowSizeAppBarSecondary(false);
            setPrevPathname(pathname);
        }
    }, [pathname]);

    return React.useMemo(() => ({
        toolbarRef,
        toolbarSecondaryRef,
        headlineSecondaryRef,
        windowSize,
        info,
        setInfo,
        snackbarStyle,
        setSnackbarStyle,
        showCompactWindowSizeAppBarSecondary,
        setShowCompactWindowSizeAppBarSecondary,
        addClickCloseAppBarSecondaryEventListener,
        removeClickCloseAppBarSecondaryEventListener,
        onClickCloseAppBarSecondary: handleClickCloseAppBarSecondary,
        isWindowSizeCompact,
        isWindowSizeMedium,
        isWindowSizeSpanMedium,
        isWindowSizeExpanded,
        isWindowSizeSpanExpanded,
    }), [
        windowSize,
        info,
        snackbarStyle,
        showCompactWindowSizeAppBarSecondary,
        handleClickCloseAppBarSecondary,
        isWindowSizeCompact,
        isWindowSizeMedium,
        isWindowSizeSpanMedium,
        isWindowSizeExpanded,
        isWindowSizeSpanExpanded,
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