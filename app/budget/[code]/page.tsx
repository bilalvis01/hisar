import React from "react";
import style from "./budget-detail.module.scss";
import BudgetDetailCard from "../../../lib/templates/budget-detail-card/BudgetDetailCard";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <BudgetDetailCard />
            </div>
        </>
    );
}