import React from "react";
import style from "./button.module.scss";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";
import type { ButtonBaseProps } from "./ButtonBase";

interface ButtonProps extends ButtonBaseProps {}

export default function Button({ classes: externalClasses, ...props }: ButtonProps) {
    const classes = {
        ...style,
        ...externalClasses,
    };

    return (
        <ButtonBase 
            classes={classes}
            {...props} 
        />
    );
}