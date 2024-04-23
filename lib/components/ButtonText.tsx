import React from "react";
import ButtonBase from "./ButtonBase";
import type { ButtonBaseProps } from "./ButtonBase";

type ButtonTextProps = ButtonBaseProps;

export default function ButtonSolid(props: ButtonTextProps) {
    return <ButtonBase variant="text" {...props} />
}