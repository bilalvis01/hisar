import React from "react";
import style from "./budget.module.scss";
import Table from "../../templates/BudgetTable";
import Add from "../../templates/BudgetAdd";

export default function Page() {
    return (
        <div className={style.card}>
            <header className={style.header}>
                <Add heading="Tambah Budget" />
            </header>
            <Table />
        </div>
    );
}