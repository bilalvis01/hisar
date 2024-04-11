import React from "react";
import style from "./home.module.scss";
import CardFilled from "../components/CardFilled";
import clsx from "clsx";
import format from "../utils/format";

export default function Page() {
    return (
        <div className={style.cardContainer}>
            <CardFilled className={style.card}>
                <div className={style.cardContent}>
                    <h2 className={clsx(style.cardHeader, "text-title-medium")}>TOTAL BUDGET</h2>
                    <p className={clsx(style.cardBody, "text-headline-small")}>{format.currency(500_000)}</p>
                </div>
            </CardFilled>
            <CardFilled className={style.card}>
                <div className={style.cardContent}>
                    <h2 className={clsx(style.cardHeader, "text-title-medium")}>TOTAL EXPANSE</h2>
                    <p className={clsx(style.cardBody, "text-headline-small")}>{format.currency(300_000)}</p>
                </div>
            </CardFilled>
            <CardFilled className={style.card}>
                <div className={style.cardContent}>
                    <h2 className={clsx(style.cardHeader, "text-title-medium")}>SISA</h2>
                    <p className={clsx(style.cardBody, "text-headline-small")}>{format.currency(200_000)}</p>
                </div>
            </CardFilled> 
        </div>
    )
}