import React from "react";
import style from "./expense-detail.module.scss";
import ExpenseDetailCard from "../../../lib/templates/expense-detail-card/ExpenseDetailCard";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <ExpenseDetailCard />
            </div>
        </>
    );
}