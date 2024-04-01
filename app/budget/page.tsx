import React from "react";
import style from "./budget.module.scss";
import Table from "./Table";

export default function Page() {
    return (
        <div className={style.card}>
            <header className={style.header}>
                <button>
                    Tambah
                </button>
            </header>
            <Table />
        </div>
    );
}