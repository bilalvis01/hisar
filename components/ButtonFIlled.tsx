import React from "react";
import ButtonBase from "./ButtonBase";
import type { ButtonBaseProps } from "./ButtonBase";

type ButtonFilledProps = ButtonBaseProps;

export default function ButtonFilled(props: ButtonFilledProps) {
    return <ButtonBase variant="filled" {...props} />
}