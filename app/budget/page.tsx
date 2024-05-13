import React from "react";
import style from "./budget.module.scss";
import BudgetCard from "../../lib/templates/buget-card/BudgetCard";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <BudgetCard />
            </div>
        </>
    );
}