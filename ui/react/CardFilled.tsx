import React from "react";
import clsx from "clsx";
import CardBase, { CardBaseProps } from "./CardBase";

interface CardFilledProps extends CardBaseProps {}

export default function CardFilled(props: CardFilledProps) {
    return (
        <CardBase variant="filled" {...props} />
    );
}