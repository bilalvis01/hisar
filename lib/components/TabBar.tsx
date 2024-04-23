"use client"

import React from "react";

interface TabBarOptions {
    select?: string;
}

type ContextType = TabBarOptions | null;

const TabBarContext = React.createContext<ContextType>(null);

export const useTabBarContext = () => {
    const context = React.useContext(TabBarContext);

    if (context == null) {
        throw new Error("Tab must be wrapped in <TabBar />");
    }

    return context;
}

interface TabBarProps extends TabBarOptions {
    children: React.ReactNode;
}

export default function TabBar({ children, select }: TabBarProps) {
    const context = React.useMemo(() => ({
        select
    }), [select])

    return (
        <TabBarContext.Provider value={context}>
            {children}
        </TabBarContext.Provider>
    )
}