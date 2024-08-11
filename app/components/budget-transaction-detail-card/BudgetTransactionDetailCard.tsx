"use client";

import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import idr from "../../../lib/utils/idr";
import { useQuery } from "@apollo/client";
import { GET_BUDGET_TRANSACTION_BY_ID } from "../../../lib/graphql/budget-transaction-documents";
import { useParams } from "next/navigation";
import style from "./BudgetTransactionDetailCard.module.scss";
import ProgressCircular from "../../../ui/react/ProgressCircular";
import { useTemplateContext } from "../../context/TemplateProvider";
import { notFound } from "next/navigation";
import date from "../../../lib/utils/date";
import { ButtonText } from "../../../ui/react/ButtonText";
import ExpenseDelete from "../expense-delete/ExpenseDelete";
import ExpenseUpdateForm from "../expense-update-form/ExpenseUpdateForm";
import { IconButtonFilled } from "../../../ui/react/IconButtonFilled";
import IconPencil from "../../../lib/icons/Pencil";
import IconThreeDotsVertial from "../../../lib/icons/ThreeDotsVertical";
import { Menu, MenuItem } from "../../../ui/react/Menu";
import { 
    useFloating, 
    useClick, 
    useInteractions, 
    useDismiss, 
    offset,
    autoUpdate,
} from "@floating-ui/react";
import { IconButtonStandard } from "../../../ui/react/IconButtonStandard";
import { useRouter } from "next/navigation";
import { BUDGET_EXPENSE } from "../../../lib/database/budget-transaction-type";
import { POLL_INTERVAL } from "../../../lib/graphql/pollInterval";
import { RECORD_NOT_FOUND } from "../../../lib/graphql/error-code";

export default function ExpenseDetailCard(
    { disableBudgetSelectionWhenUpdate = false }: { disableBudgetSelectionWhenUpdate?: boolean }
) {
    const { id } = useParams<{ id: string }>();
    const { loading, error, data } = useQuery(GET_BUDGET_TRANSACTION_BY_ID, {
        variables: { input: { id } },
        pollInterval: POLL_INTERVAL,
    });
    const { 
        windowSize,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
        toolbarRef,
    } = useTemplateContext();
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const [openExpenseDelete, setOpenExpenseDelete] = React.useState(false);
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: openActionsMenu,
        onOpenChange: setOpenActionsMenu,
        placement: "bottom-end",
        middleware: [offset(4)],
        whileElementsMounted: autoUpdate,
    });
    const router = useRouter();

    const clickActionsMenu = useClick(context);
    const dismissActionsMenu = useDismiss(context);

    const { getFloatingProps, getReferenceProps } = useInteractions([
        clickActionsMenu,
        dismissActionsMenu,
    ]);

    const budgetTransaction = data ? data.budgetTransactionById : null;
    const transactionType = budgetTransaction ? budgetTransaction.transactionType : null;

    const handleOpenExpenseUpdateForm = React.useCallback(() => {
        setOpenExpenseUpdateForm(true);
    }, []);

    const handleOpenExpenseDelete = React.useCallback(() => {
        setOpenExpenseDelete(true);
    }, []);

    const handleBack = React.useCallback(() => {
        router.back();
    }, [router]);

    const isExpense = React.useCallback(() => {
        return transactionType === BUDGET_EXPENSE;
    }, [transactionType]);

    if (loading) return (
        <div className={clsx(style.placeholder)}>
            <ProgressCircular />
        </div>
    );

    if (
        error && 
        error.graphQLErrors.some(
            (error) => error.extensions.code === RECORD_NOT_FOUND
        )
    ) {
        notFound();
    }

    if (error) return (
        <div className={clsx(style.placeholder)}>
            {error.message}
        </div>
    );

    return (
        <div className={style.card}>
            <header className={style.header}>
                <h2 className={clsx("text-title-large", style.headline)}>
                    {budgetTransaction && budgetTransaction.description.toUpperCase()}
                </h2>
                {isWindowSizeExpanded() && (
                    <ButtonText onClick={handleBack}>
                        Kembali
                    </ButtonText>
                )}
                {isExpense() && isWindowSizeExpanded() && (
                    <>
                        <ButtonText onClick={handleOpenExpenseUpdateForm}>
                            Edit
                        </ButtonText>
                        <div>
                            <IconButtonStandard {...getReferenceProps()} ref={refs.setReference}>
                                <IconThreeDotsVertial />
                            </IconButtonStandard>
                            {openActionsMenu && (
                                <Menu 
                                    {...getFloatingProps()} 
                                    ref={refs.setFloating} 
                                    style={floatingStyles} 
                                    className={style.actionsMenu}
                                >
                                    <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
                                </Menu>
                            )}
                        </div>
                    </>
                )}
            </header>
            <div className={style.body}>
                {budgetTransaction && (
                    <ul className={style.description}>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">ID</div>
                            <div className="text-body-small">{budgetTransaction.id}</div>
                        </li>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">Deskripsi</div>
                            <div className="text-body-small">{budgetTransaction.description}</div>
                        </li>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">Nama Anggaran</div>
                            <div className="text-body-small">{budgetTransaction.budgetName}</div>
                        </li>
                        <li>
                            <div className="text-title-small">{isExpense() ? "Terpakai" : "Anggaran"}</div>
                            <div className="text-body-small">{idr.format(budgetTransaction.amount)}</div>
                        </li>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">Dibuat</div>
                            <div className="text-body-small">{date.format(budgetTransaction.createdAt)}</div>
                        </li>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">Diperbarui</div>
                            <div className="text-body-small">{date.format(budgetTransaction.createdAt)}</div>
                        </li>
                    </ul>
                )}
            </div>
            {budgetTransaction && isExpense() && (
                <ExpenseUpdateForm
                    expense={budgetTransaction}
                    open={openExpenseUpdateForm}
                    onOpenChange={setOpenExpenseUpdateForm}
                    disableBudgetSelection={disableBudgetSelectionWhenUpdate}
                />
            )}
            {budgetTransaction && isExpense() && (
                <ExpenseDelete
                    expenses={[budgetTransaction]}
                    open={openExpenseDelete}
                    onOpenChange={setOpenExpenseDelete}
                    onSuccess={() => router.back()}
                />
            )}
            {isWindowSizeSpanMedium() && isExpense() && createPortal(
                <>
                    <IconButtonFilled onClick={handleOpenExpenseUpdateForm}>
                        <IconPencil />
                    </IconButtonFilled>
                    <div>
                        <IconButtonFilled {...getReferenceProps()} ref={refs.setReference}>
                            <IconThreeDotsVertial />
                        </IconButtonFilled>
                        {openActionsMenu && (
                            <Menu 
                                {...getFloatingProps()} 
                                ref={refs.setFloating} 
                                style={floatingStyles} 
                                className={style.actionsMenu}
                            >
                                <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
                                <MenuItem onClick={handleBack}>Kembali</MenuItem>
                            </Menu>
                        )}
                    </div>
                </>,
                toolbarRef.current
            )}
            {isWindowSizeSpanMedium() && !isExpense() && createPortal(
                <div>
                    <IconButtonFilled {...getReferenceProps()} ref={refs.setReference}>
                        <IconThreeDotsVertial />
                    </IconButtonFilled>
                    {openActionsMenu && (
                        <Menu 
                            {...getFloatingProps()} 
                            ref={refs.setFloating} 
                            style={floatingStyles} 
                            className={style.actionsMenu}
                        >
                            <MenuItem onClick={handleBack}>Kembali</MenuItem>
                        </Menu>
                    )}
                </div>,
                toolbarRef.current
            )}
        </div>
    );
}