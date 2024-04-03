import React from "react";
import style from "./button-icon.module.scss";
import clsx from "clsx";
import ButtonBase from "./ButtonBase";
import type { ButtonBaseProps } from "./ButtonBase";

interface ButtonIconProps extends ButtonBaseProps {} 

export default function ButtonIcon({ classes: externalClasses, ...props }: ButtonIconProps) {
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