import React from "react";
import ButtonBase from "./ButtonBase";
import type { ButtonBaseProps } from "./ButtonBase";

type ButtonSolidProps = ButtonBaseProps;

export default function ButtonSolid(props: ButtonSolidProps) {
    return <ButtonBase variant="filled" {...props} />
}