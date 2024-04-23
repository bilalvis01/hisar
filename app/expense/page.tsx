import React from "react";
import style from "./expense.module.scss";
import Table from "../../lib/templates/expense-table/ExpenseTable";
import BudgetAddForm from "../../lib/templates/expense-add-form/ExpenseAddForm";
import clsx from "clsx";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <div className={style.card}>
                    <header className={style.header}>
                        <h2 className={clsx("text-title-medium", style.headline)}>Budget</h2>
                        <div className={style.toolbar}>
                            <BudgetAddForm />
                        </div>
                    </header>
                    <div className={style.body}>
                        <Table />
                    </div>
                </div>
            </div>
        </>
    );
}