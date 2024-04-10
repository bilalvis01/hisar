import React from "react";
import clsx from "clsx";
import Card, { CardProps } from "./Card";

interface CardFilledProps extends CardProps {}

export default function CardFilled(props: CardFilledProps) {
    return (
        <Card {...props} />
    );
}