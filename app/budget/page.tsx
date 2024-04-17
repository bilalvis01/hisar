import React from "react";
import style from "./budget.module.scss";
import Table from "../../templates/budget-table/BudgetTable";
import AddFormDialogFullscreen from "../../templates/budget-add-form-dialog-fullscreen/BudgetAddFormDialogFullScreen";

export default function Page() {
    return (
        <div className={style.container}>
            <div className={style.card}>
                <header className={style.header}>
                    <AddFormDialogFullscreen />
                </header>
                <div className={style.body}>
                    <Table />
                </div>
            </div>
        </div>
    );
}