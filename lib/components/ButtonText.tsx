import React from "react";
import { ButtonBase, LinkBase } from "./ButtonBase";
import type { ButtonBaseProps, LinkBaseProps } from "./ButtonBase";

type ButtonTextProps = ButtonBaseProps;

export function ButtonText(props: ButtonTextProps) {
    return <ButtonBase {...props} variant="text" />
}

export function LinkText(props: LinkBaseProps) {
    return <LinkBase {...props} variant="text" />
}