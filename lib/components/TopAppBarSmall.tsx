import React from "react";
import clsx from "clsx";

export const TopAppBarSmall = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement>
>(function TopAppBarSmall({
    className,
    children,
    ...props
}, ref) {
    return (
        <header {...props} ref={ref} className={clsx("top-app-bar-small", className)}>
            <div className="container">
                {children}
            </div>
        </header>
    )
});

export const Headline = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLProps<HTMLHeadingElement>
>(function Headline({ 
    className, 
    ...props 
}, ref) {
    return (
        <h2 {...props} ref={ref} className={clsx("headline", className)} />
    );
})

export const Brand = React.forwardRef<
    HTMLElement,
    React.HTMLProps<HTMLElement>
>(function Brand({
    className,
    ...props
}, ref) {
    return (
        <nav {...props} ref={ref} className={clsx("brand", className)} />
    );
})