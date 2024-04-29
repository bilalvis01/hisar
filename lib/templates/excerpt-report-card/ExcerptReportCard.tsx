"use client"

import React from "react";
import style from "./ExcerptReportCard.module.scss";
import CardOutlined from "../../../lib/components/CardOutlined";
import clsx from "clsx";
import format from "../../../lib/utils/format";
import { GET_EXCERPT_REPORT } from "../../../lib/graphql-documents";
import { useQuery } from "@apollo/client";
import ProgressCircular from "../../../lib/components/ProgressCircular";

export default function ExcerptReportCard({ report = "budget" }: { report: "budget" | "expense" | "balance" }) {
    const { data, loading, error } = useQuery(GET_EXCERPT_REPORT);

    return (
        <div className={style.card}>
            <div className={style.cardContent}>
                <h2 className={clsx(style.cardHeader, "text-title-medium")}>{report.toUpperCase()}</h2>
                {loading && (
                    <div className={style.loading}>
                        <ProgressCircular />
                    </div>
                )}
                {error && <span>Server Error</span>}
                {data && data.excerptReport && (
                    <p className={clsx(style.cardBody, "text-headline-small")}>{format.currency(data.excerptReport[report])}</p>
                )}
            </div>
        </div>
    )
}