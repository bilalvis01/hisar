import React from "react";
import style from "./budget.module.scss";
import Table from "../../templates/budget-table/BudgetTable";
import BudgetAddFormMobile from "../../templates/budget-add-from-mobile/BudgetAddFormMobile";
import BudgetAddFormDesktop from "../../templates/BudgetAddFormDesktop";

export default function Page() {
    return (
        <>
            <div className={style.container}>
                <div className={style.card}>
                    <header className={style.header}>
                        <BudgetAddFormDesktop />
                    </header>
                    <div className={style.body}>
                        <Table />
                    </div>
                </div>
            </div>
            <BudgetAddFormMobile />
        </>
    );
}