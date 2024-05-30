"use client";

import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import idr from "../../utils/idr";
import { useQuery } from "@apollo/client";
import { GET_BUDGET_TRANSACTION_BY_ID } from "../../graphql/budget-transaction-documents";
import { useParams } from "next/navigation";
import style from "./BudgetTransactionDetailCard.module.scss";
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
import IconThreeDotsVertial from "../../icons/ThreeDotsVertical";
import { Menu, MenuItem } from "../../components/Menu";
import { 
    useFloating, 
    useClick, 
    useInteractions, 
    useDismiss, 
    offset,
} from "@floating-ui/react";
import { IconButtonStandard } from "../../components/IconButtonStandard";
import { useRouter } from "next/navigation";
import { BUDGET_EXPENSE } from "../../database/budget-transaction-type";

export default function ExpenseDetailCard(
    { disableBudgetSelectionWhenUpdate = false }: { disableBudgetSelectionWhenUpdate?: boolean }
) {
    const { id } = useParams<{ id: string }>();
    const { loading, error, data } = useQuery(GET_BUDGET_TRANSACTION_BY_ID, {
        variables: { input: { id } }
    });
    const { 
        windowSize,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
        setShowCompactWindowSizeAppBarSecondary,
        addClickCloseAppBarSecondaryEventListener,
        removeClickCloseAppBarSecondaryEventListener,
        toolbarSecondaryRef,
    } = useTemplateContext();
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const [openExpenseDelete, setOpenExpenseDelete] = React.useState(false);
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: openActionsMenu,
        onOpenChange: setOpenActionsMenu,
        placement: "bottom-end",
        middleware: [offset(4)],
    });
    const router = useRouter();

    const clickActionsMenu = useClick(context);
    const dismissActionsMenu = useDismiss(context);

    const { getFloatingProps, getReferenceProps } = useInteractions([
        clickActionsMenu,
        dismissActionsMenu,
    ]);

    if (data && data.budgetTransactionById.code === 404) {
        notFound();
    }

    const budgetTransaction = data ? data.budgetTransactionById.budgetTransaction : null;
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

    React.useEffect(() => {
        if (isWindowSizeSpanMedium()) {
            setShowCompactWindowSizeAppBarSecondary(true);
            addClickCloseAppBarSecondaryEventListener(() => {
                setShowCompactWindowSizeAppBarSecondary(false);
                handleBack();
            });
        } else {
            setShowCompactWindowSizeAppBarSecondary(false);
        }

        () => removeClickCloseAppBarSecondaryEventListener();
    }, [windowSize]);

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
                                        <ul>
                                            <li>
                                                <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
                                            </li>
                                        </ul>
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
                                <div className="text-title-small">Nama Budget</div>
                                <div className="text-body-small">{budgetTransaction.budgetName}</div>
                            </li>
                            <li>
                                <div className="text-title-small">{isExpense() ? "Terpakai" : "Budget"}</div>
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
                        expense={budgetTransaction}
                        open={openExpenseDelete}
                        onOpenChange={setOpenExpenseDelete}
                        onSuccess={() => router.back()}
                    />
                )}
                {isWindowSizeSpanMedium() && isExpense() && createPortal(
                    <>
                        <IconButtonStandard onClick={handleOpenExpenseUpdateForm}>
                            <IconPencil />
                        </IconButtonStandard>
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
                                    <ul>
                                        <li>
                                            <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
                                        </li>
                                    </ul>
                                </Menu>
                            )}
                        </div>
                    </>,
                    toolbarSecondaryRef.current
                )}
            </div>
        </>
    );
}