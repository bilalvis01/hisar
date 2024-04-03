import React from "react";
import style from "./button.module.scss";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";
import type { Classes } from "./ButtonBase";

type ButtonProps = Omit<React.ComponentProps<typeof ButtonBase>, "classes"> & {
    classes?: Partial<Classes>;
};

export default function Button({ classes: externalClasses, ...props }: ButtonProps) {
    const defaultClasses = {
        root: style.button,
        variant: {
            solid: style.solid,
            outlined: style.outlined, 
        },
        color: {
            primary: style.primary,
            secondary: style.secondary,
        },
        size: {
            sm: style.sm,
            md: style.md,
            lg: style.lg
        }
    };

    const classes = {
        ...defaultClasses,
        ...externalClasses,
    };

    return (
        <ButtonBase 
            classes={classes}
            {...props} 
        />
    );
}