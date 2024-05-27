"use client";

import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import idr from "../../utils/idr";
import { useQuery } from "@apollo/client";
import { GET_EXPENSE_BY_ID } from "../../graphql/documents";
import { useParams } from "next/navigation";
import style from "./ExpenseDetailCard.module.scss";
import ProgressCircular from "../../components/ProgressCircular";
import { useTemplateContext } from "../Template";
import { notFound } from "next/navigation";
import date from "../../utils/date";
import Link from "next/link";
import { LinkText } from "../../components/ButtonText";
import { ButtonText } from "../../components/ButtonText";
import ExpenseDelete from "../expense-delete/ExpenseDelete";
import ExpenseUpdateForm from "../expense-update-form/ExpenseUpdateForm";
import { IconLinkFilled } from "../../components/IconButtonFilled";
import { IconButtonFilled } from "../../components/IconButtonFilled";
import IconArrowLeft from "../../icons/ArrowLeft";
import IconPencil from "../../icons/Pencil";
import IconTrash from "../../icons/Trash";

export default function ExpenseDetailCard() {
    const { id } = useParams<{ id: string }>();
    const { loading, error, data } = useQuery(GET_EXPENSE_BY_ID, {
        variables: { id }
    });
    const { 
        toolbarRef, 
        windowSize,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
    } = useTemplateContext();
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const [openExpenseDelete, setOpenExpenseDelete] = React.useState(false);

    const handleOpenExpenseUpdateForm = React.useCallback(() => {
        setOpenExpenseUpdateForm(true);
    }, []);

    const handleOpenExpenseDelete = React.useCallback(() => {
        setOpenExpenseDelete(true);
    }, []);

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
                    {isWindowSizeExpanded() && (
                        <>
                            <Link href={`/expense`} passHref legacyBehavior>
                                <LinkText>
                                    Kembali
                                </LinkText>
                            </Link>
                            <ButtonText onClick={handleOpenExpenseUpdateForm}>
                                Edit
                            </ButtonText>
                            <ButtonText onClick={handleOpenExpenseDelete}>
                                Hapus
                            </ButtonText>
                        </>
                    )}
                </header>
                <div className={style.body}>
                    {expense && (
                        <ul className={style.description}>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Kode</div>
                                <div className="text-body-small">{expense.id}</div>
                            </li>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Deskripsi</div>
                                <div className="text-body-small">{expense.description}</div>
                            </li>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Budget</div>
                                <div className="text-body-small">{expense.budgetName}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Terpakai</div>
                                <div className="text-body-small">{idr.format(expense.amount)}</div>
                            </li>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Tanggal</div>
                                <div className="text-body-small">{date.format(expense.createdAt)}</div>
                            </li>
                        </ul>
                    )}
                </div>
                {expense && (
                    <ExpenseUpdateForm
                        expense={expense}
                        open={openExpenseUpdateForm}
                        onOpenChange={setOpenExpenseUpdateForm}
                    />
                )}
                {expense && (
                    <ExpenseDelete
                        expense={expense}
                        open={openExpenseDelete}
                        onOpenChange={setOpenExpenseDelete}
                    />
                )}
                {isWindowSizeSpanMedium() && createPortal(
                <>
                    <Link href={`/expense`} passHref legacyBehavior>
                        <IconLinkFilled>
                            <IconArrowLeft />
                        </IconLinkFilled>
                    </Link>
                    <IconButtonFilled onClick={handleOpenExpenseUpdateForm}>
                        <IconPencil />
                    </IconButtonFilled>
                    <IconButtonFilled onClick={handleOpenExpenseDelete}>
                        <IconTrash />
                    </IconButtonFilled>
                </>,
                toolbarRef.current
            )}
            </div>
        </>
    );
}