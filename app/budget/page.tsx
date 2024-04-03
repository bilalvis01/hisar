import React from "react";
import style from "./budget.module.scss";
import Table from "./Table";
import Add from "./Add";

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