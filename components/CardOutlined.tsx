import React from "react";
import clsx from "clsx";
import CardBase, { CardBaseProps } from "./CardBase";

interface CardOutlinedProps extends CardBaseProps {}

export default function CardOutlined(props: CardOutlinedProps) {
    return (
        <CardBase variant="outlined" {...props} />
    );
}