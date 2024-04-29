import React from "react";
import ExcerptReportCard from "../lib/templates/excerpt-report-card/ExcerptReportCard";
import style from "./home.module.scss";

export default function Page() {
    return (
        <div className={style.container}>
            <ExcerptReportCard report="budget" />
            <ExcerptReportCard report="expense" />
            <ExcerptReportCard report="balance" />
        </div>
    )
}