import React from "react";
import style from "./budget.module.scss";
import Table from "../../lib/templates/budget-table/BudgetTable";
import BudgetAddForm from "../../lib/templates/budget-add-form/BudgetAddForm";
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