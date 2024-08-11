"use client"

import React from "react";
import style from "./ExcerptReportCard.module.scss";
import clsx from "clsx";
import idr from "../../../lib/utils/idr";
import { GET_EXCERPT_REPORT } from "../../../lib/graphql/budget-documents";
import { useQuery } from "@apollo/client";
import ProgressCircular from "../../../ui/react/ProgressCircular";
import CardOutlined from "../../../ui/react/CardOutlined";
import { POLL_INTERVAL } from "../../../lib/graphql/pollInterval";

const headline = {
    budget: "ANGGARAN",
    expense: "REALISASI ANGGARAN",
    balance: "SELISIH ANGGARAN",
}

export default function ExcerptReportCard({ report = "budget" }: { report: "budget" | "expense" | "balance" }) {
    const { data, loading, error } = useQuery(GET_EXCERPT_REPORT, {
        pollInterval: POLL_INTERVAL,
    });

    return (
        <CardOutlined className={style.card}>
            <header className={style.cardHeader}>
                <h2 className="text-title-medium">{headline[report]}</h2>
            </header>
            {loading && (
                <div className={style.placeholder}>
                    <ProgressCircular />
                </div>
            )}
            {error && (
                <div className={style.placeholder}>
                    {error.message}
                </div>
            )}
            {data && data.excerptReport && (
                <div className={clsx(style.cardBody, "text-headline-small")}>
                    {idr.format(data.excerptReport[report])}
                </div>
            )}
        </CardOutlined>
    )
}