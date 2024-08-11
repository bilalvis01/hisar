import React from "react";
import { ButtonBase, LinkBase } from "./ButtonBase";
import type { ButtonBaseProps, LinkBaseProps } from "./ButtonBase";

export const ButtonText = React.forwardRef<
    HTMLButtonElement,
    ButtonBaseProps
>(function ButtonText(props, ref) {
    return <ButtonBase {...props} ref={ref} variant="text" />
});

export const LinkText = React.forwardRef<
    HTMLAnchorElement,
    LinkBaseProps
>(function LinkText(props, ref) {
    return <LinkBase {...props} ref={ref} variant="text" />
});