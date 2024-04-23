import React from "react";
import clsx from "clsx";

export function TopAppBarSmall({
    className,
    children,
    ...props
}: React.HTMLProps<HTMLElement>) {
    return (
        <header {...props} className={clsx("top-app-bar-small", className)}>
            <div className="container">
                {children}
            </div>
        </header>
    )
}

export function Headline({ 
    className, 
    ...props 
}: React.HTMLProps<HTMLHeadingElement>) {
    return (
        <h2 {...props} className={clsx("headline", className)} />
    );
}

export function Brand({
    className,
    ...props
}: React.HTMLProps<HTMLElement>) {
    return (
        <nav {...props} className={clsx("brand", className)} />
    );
}