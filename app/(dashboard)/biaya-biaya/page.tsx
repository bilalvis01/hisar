import React from "react";
import style from "./expense.module.scss";
import ExpenseCard from "../../components/expense-card/ExpenseCard";

export default function Page() {
    return (
        <div className={style.container}>
            <ExpenseCard/>
        </div>
    );
}