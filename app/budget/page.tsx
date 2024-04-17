import React from "react";
import style from "./budget.module.scss";
import Table from "../../templates/budget-table/BudgetTable";
import AddFormDialogFullscreen from "../../templates/budget-add-form-dialog-fullscreen/BudgetAddFormDialogFullscreen";
import BudgetAdd from "../../templates/budget-add/BudgetAdd";

export default function Page() {
    return (
        <div className={style.container}>
            <div className={style.card}>
                <header className={style.header}>
                    <BudgetAdd />
                </header>
                <div className={style.body}>
                    <Table />
                </div>
            </div>
        </div>
    );
}