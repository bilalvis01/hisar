"use client";

import React from "react";
import clsx from "clsx";
import idr from "../../utils/idr";
import { useQuery } from "@apollo/client";
import { GET_EXPENSE_BY_ID } from "../../graphql-documents";
import { useParams } from "next/navigation";
import style from "./ExpenseDetailCard.module.scss";
import ProgressCircular from "../../components/ProgressCircular";
import { useTemplateContext } from "../Template";
import { notFound } from "next/navigation";
import date from "../../utils/date";

export default function ExpenseDetailCard() {
    const { id } = useParams<{ id: string }>();
    const { loading, error, data } = useQuery(GET_EXPENSE_BY_ID, {
        variables: { id: Number(id) }
    });
    const { 
        toolbarRef, 
        windowSize,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
    } = useTemplateContext();

    if (data && data.expenseById.code === 404) {
        notFound();
    }

    const expense = data ? data.expenseById.expense : null;

    if (loading) return (
        <>
            <div className={clsx(style.placeholder)}>
                <ProgressCircular />
            </div>
        </>
    );

    if (error) return (
        <div className={clsx(style.placeholder)}>
            {error.message}
        </div>
    );

    return (
        <>
            <div className={style.card}>
                <header className={style.header}>
                    <h2 className={clsx("text-title-large", style.headline)}>
                        {expense && expense.description.toUpperCase()}
                    </h2>
                </header>
                <div className={style.body}>
                    {expense && (
                        <ul className={style.description}>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Deskripsi</div>
                                <div className="text-body-small">{expense.description}</div>
                            </li>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Budget</div>
                                <div className="text-body-small">{expense.budgetAccount}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Terpakai</div>
                                <div className="text-body-small">{idr.format(expense.amount)}</div>
                            </li>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Dibuat</div>
                                <div className="text-body-small">{date.format(expense.createdAt)}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Diperbarui</div>
                                <div className="text-body-small">{date.format(expense.updatedAt)}</div>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}