"use client"

import React from "react";
import style from "./ExcerptReportCard.module.scss";
import clsx from "clsx";
import idr from "../../utils/idr";
import { GET_EXCERPT_REPORT } from "../../../lib/graphql-documents";
import { useQuery } from "@apollo/client";
import ProgressCircular from "../../../lib/components/ProgressCircular";

export default function ExcerptReportCard({ report = "budget" }: { report: "budget" | "expense" | "balance" }) {
    const { data, loading, error } = useQuery(GET_EXCERPT_REPORT);

    return (
        <div className={style.card}>
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
        </div>
    )
}