import React from "react";
import style from "./budget.module.scss";
import BudgetCard from "../../components/budget-card/BudgetCard";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <BudgetCard />
            </div>
        </>
    );
}