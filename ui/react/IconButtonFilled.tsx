import React from "react";
import { IconButtonBase, IconLinkBase } from "./IconButtonBase";
import type { IconButtonBaseProps } from "./IconButtonBase";

export const IconButtonFilled = React.forwardRef<
    HTMLButtonElement,
    IconButtonBaseProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(function IconButtonStandard(props, ref) {
    return <IconButtonBase {...props} ref={ref} variant="filled" />;
});

export const IconLinkFilled = React.forwardRef<
    HTMLAnchorElement,
    IconButtonBaseProps & React.HTMLProps<HTMLAnchorElement>
>(function IconLinkStandard(props, ref) {
    return <IconLinkBase {...props} ref={ref} variant="filled" />;
});