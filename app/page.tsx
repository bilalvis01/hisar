import React from "react";
import style from "./home.module.scss";

export default function Page() {
    return (
        <div className={style.wrapper}>
            <div className={style.card}>
                <h3 className={style.cardHeader}>TOTAL BUDGET</h3>
                <p className={style.cardContent}>Rp. 500.000,-</p>
            </div>
            <div className={style.card}>
                <h3 className={style.cardHeader}>TOTAL EXPANSE</h3>
                <p className={style.cardContent}>Rp. 300.000,-</p>
            </div>
            <div className={style.card}>
                <h3 className={style.cardHeader}>SISA</h3>
                <p className={style.cardContent}>Rp. 200.000,-</p>
            </div>
        </div>
    )
}