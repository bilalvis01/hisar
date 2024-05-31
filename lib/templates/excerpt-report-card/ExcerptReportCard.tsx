"use client"

import React from "react";
import style from "./ExcerptReportCard.module.scss";
import clsx from "clsx";
import idr from "../../utils/idr";
import { GET_EXCERPT_REPORT } from "../../graphql/budget-documents";
import { useQuery } from "@apollo/client";
import ProgressCircular from "../../../lib/components/ProgressCircular";
import CardOutlined from "../../components/CardOutlined";
import { POLL_INTERVAL } from "../../utils/pollInterval";

export default function ExcerptReportCard({ report = "budget" }: { report: "budget" | "expense" | "balance" }) {
    const { data, loading, error } = useQuery(GET_EXCERPT_REPORT, {
        pollInterval: POLL_INTERVAL,
    });

    return (
        <CardOutlined className={style.card}>
            <header className={style.cardHeader}>
                <h2 className="text-title-medium">{report.toUpperCase()}</h2>
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