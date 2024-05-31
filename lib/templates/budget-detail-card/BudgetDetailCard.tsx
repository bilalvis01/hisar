"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import idr from "../../utils/idr";
import Checkbox from "../../components/Checkbox";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_BUDGET_BY_CODE } from "../../graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";
import Table from "../table/Table";
import { useParams } from "next/navigation";
import style from "./BudgetDetailCard.module.scss";
import ProgressCircular from "../../components/ProgressCircular";
import BudgetUpdateForm from "../budget-update-form/BudgetUpdateForm";
import BudgetDelete from "../budget-delete/BudgetDelete";
import { useTemplateContext } from "../Template";
import { useRouter, notFound } from "next/navigation";
import { ButtonText } from "../../components/ButtonText";
import { IconLinkFilled } from "../../components/IconButtonFilled";
import { IconButtonFilled } from "../../components/IconButtonFilled";
import IconArrowLeft from "../../icons/ArrowLeft";
import IconPencil from "../../icons/Pencil";
import IconTrash from "../../icons/Trash";
import Link from "next/link";
import { LinkText } from "../../components/ButtonText";
import { BudgetTransaction } from "../../graphql/generated/graphql";
import ExpenseDelete from "../expense-delete/ExpenseDelete";
import ExpenseDeleteMany from "../expense-delete-many/ExpenseDeleteMany";
import ExpenseUpdateForm from "../expense-update-form/ExpenseUpdateForm";
import ExpenseAddForm from "../expense-add-form/ExpenseAddForm";
import ButtonFilled from "../../components/ButtonFIlled";
import { Menu, MenuItem } from "../../components/Menu";
import { IconButtonStandard } from "../../components/IconButtonStandard";
import IconThreeDotsVertial from "../../icons/ThreeDotsVertical";
import { 
    useFloating, 
    useClick, 
    useInteractions, 
    useDismiss, 
    offset,
} from "@floating-ui/react";
import Fab from "../fab/Fab";
import IconPlusLg from "../../icons/PlusLg";
import IconEye from "../../icons/Eye";
import date from "../../utils/date";
import { BUDGET_EXPENSE } from "../../database/budget-transaction-type";
import { exportBudgetTransactions } from "../../utils/exportBudgetTransaction";

const columnHelper = createColumnHelper<BudgetTransaction>();

const columns = [
    columnHelper.display({
        id: "select",
        header: ({ table }) => (
            <Checkbox 
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
            />
        ),
        cell: ({ row }) => (
            <div className="checkbox-container">
                <Checkbox 
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    indeterminate={row.getIsSomeSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            </div>
        ),
    }),
    columnHelper.accessor("id", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>ID</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("description", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DESKIPSI </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                 <Link href={`/budget/${info.row.original.budgetCode}/${info.row.original.id}`} passHref legacyBehavior>
                    <LinkText>
                        {info.getValue()}
                    </LinkText>
                </Link>
            </span>
        ),
    }),
    columnHelper.accessor("amount", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                TERPAKAI
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-small")}>
                {info.row.original.transactionType === BUDGET_EXPENSE && (
                    idr.format(info.getValue())
                )}
            </span>
        ),
    }),
    columnHelper.accessor("balance", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                SALDO
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-small")}>
                {idr.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("createdAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DIBUAT</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("updatedAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DIPERBARUI</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
];

export default function BudgetDetailCard() {
    const { code } = useParams<{ code: string }>();
    const { 
        loading: budgetLoading, 
        error: budgetError, 
        data: budgetData,
    } = useQuery(GET_BUDGET_BY_CODE, {
        variables: { input: { code } }
    });
    const { 
        loading: budgetTransactionsLoading, 
        error: budgetTransactionsError, 
        data: budgetTransactionData, 
    } = useQuery(GET_BUDGET_TRANSACTIONS, {
        variables: { input: { budgetCode: code } },
    });
    const [getBudgetTransactions] = useLazyQuery(GET_BUDGET_TRANSACTIONS);
    const { 
        toolbarRef, 
        windowSize,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
        isWindowSizeMedium,
        setSnackbarStyle,
        toolbarSecondaryRef,
        headlineSecondaryRef,
        setShowCompactWindowSizeAppBarSecondary,
        showCompactWindowSizeAppBarSecondary,
        addClickCloseAppBarSecondaryEventListener,
        removeClickCloseAppBarSecondaryEventListener,
    } = useTemplateContext();
    const [openBudgetUpdateForm, setOpenBudgetUpdateForm] = React.useState(false);
    const [openBudgetDelete, setOpenBudgetDelete] = React.useState(false);
    const [openExpenseAddForm, setOpenExpenseAddForm] = React.useState(false);
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const [openExpenseDelete, setOpenExpenseDelete] = React.useState(false);
    const [openExpenseDeleteMany, setOpenExpenseDeleteMany] = React.useState(false);
    const router = useRouter();
    const [rowSelection, setRowSelection] = React.useState({});
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const [openFab, setOpenFab] = React.useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: openActionsMenu,
        onOpenChange: setOpenActionsMenu,
        placement: "bottom-end",
        middleware: [offset(4)],
    });
    const fabRef = React.useRef(null);

    const clickActionsMenu = useClick(context);
    const dismissActionsMenu = useDismiss(context);

    const { getFloatingProps, getReferenceProps } = useInteractions([
        clickActionsMenu,
        dismissActionsMenu,
    ]);

    if (budgetData && budgetData.budgetByCode.code === 404) {
        notFound();
    }

    const budget = budgetData ? budgetData.budgetByCode.budget : null; 
    const budgetTransactions = budgetTransactionData 
        ? budgetTransactionData.budgetTransactions
        : [];

    const table = useReactTable({
        data: budgetTransactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: (row) => {
            return row.original.transactionType === BUDGET_EXPENSE;
        },
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection
        },
    });

    const selectedRows = table.getSelectedRowModel()
        .rows
        .map((row) => row.original);

    const isNoneSelectedRow = React.useCallback(() => {
        return selectedRows.length === 0;
    }, [selectedRows.length]);

    const isSingleSelectedRow = React.useCallback(() => {
        return selectedRows.length === 1;
    }, [selectedRows.length]);

    const isManySelectedRow = React.useCallback(() => {
        return selectedRows.length >= 2;
    }, [selectedRows.length]);

    const handleOpenBudgetUpdateForm = React.useCallback(() => {
        setOpenBudgetUpdateForm(true);
    }, []);

    const handleOpenBudgetDelete = React.useCallback(() => {
        setOpenBudgetDelete(true);
    }, []);

    const handleOpenExpenseAddForm = React.useCallback(() => {
        setOpenExpenseAddForm(true)
    }, []);

    const handleOpenExpenseUpdateForm = React.useCallback(() => {
        setOpenExpenseUpdateForm(true);
    }, []);

    const handleOpenExpenseDelete = React.useCallback(() => {
        setOpenExpenseDelete(true);
    }, []);

    const handleOpenExpenseDeleteMany = React.useCallback(() => {
        setOpenExpenseDeleteMany(true);
    }, []);

    const handleExportBudgetTransactions = React.useCallback(() => {
        exportBudgetTransactions({ budget, getBudgetTransactions });
    }, [budget, getBudgetTransactions]);

    React.useEffect(() => {
        if (!isNoneSelectedRow() && isWindowSizeSpanMedium()) {
            setShowCompactWindowSizeAppBarSecondary(true);
            addClickCloseAppBarSecondaryEventListener(() => {
                table.resetRowSelection();
                setShowCompactWindowSizeAppBarSecondary(false);
            });
        } else {
            setShowCompactWindowSizeAppBarSecondary(false);
        }

        () => removeClickCloseAppBarSecondaryEventListener();
    }, [windowSize, selectedRows.length]);

    if (budgetLoading || budgetTransactionsLoading) return (
        <>
            <div className={clsx(style.placeholder)}>
                <ProgressCircular />
            </div>
        </>
    );

    if (budgetError) return (
        <div className={clsx(style.placeholder)}>
            {budgetError.message}
        </div>
    );

    if (budgetTransactionsError) return (
        <div className={clsx(style.placeholder)}>
            {budgetTransactionsError.message}
        </div>
    );

    return (
        <>
            <div className={style.card}>
                <header className={style.header}>
                    <h2 className={clsx("text-title-large", style.headline)}>
                        {budget && budget.name.toUpperCase()}
                    </h2>
                    {isNoneSelectedRow() && isWindowSizeExpanded() && (
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
                                            <MenuItem onClick={handleOpenBudgetUpdateForm}>Edit Budget</MenuItem>
                                        </li>
                                        <li>
                                            <MenuItem onClick={handleOpenBudgetDelete}>Hapus Budget</MenuItem>
                                        </li>
                                        <li>
                                            <MenuItem onClick={handleExportBudgetTransactions}>Export</MenuItem>
                                        </li>
                                    </ul>
                                </Menu>
                            )}
                        </div>
                    )}
                </header>
                <div className={style.body}>
                    {budget && (
                        <>
                            <h3 className={clsx("text-title-medium")}>Informasi umum</h3>
                            <ul className={style.description}>
                                <li className={style.descriptionItem}>
                                    <div className="text-title-small">Kode</div>
                                    <div className="text-body-small">{budget.code}</div>
                                </li>
                                <li className={style.descriptionItem}>
                                    <div className="text-title-small">Nama</div>
                                    <div className="text-body-small">{budget.name}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Dibuat</div>
                                    <div className="text-body-small">{date.format(budget.createdAt)}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Diperbarui</div>
                                    <div className="text-body-small">{date.format(budget.updatedAt)}</div>
                                </li>
                            </ul>
                            <hr className={style.divider} />
                            <h3 className={clsx("text-title-medium")}>Informasi saldo</h3>
                            <ul className={style.description}>
                                <li>
                                    <div className="text-title-small">Budget</div>
                                    <div className="text-body-small">{idr.format(budget.amount)}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Expense</div>
                                    <div className="text-body-small">{idr.format(budget.expense)}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Saldo</div>
                                    <div className="text-body-small">{idr.format(budget.balance)}</div>
                                </li>
                            </ul>
                        </>
                    )}
                    <hr className={style.divider} />
                    <div className={style.tableContainer}>
                        <div className={style.tableContainerHeader}>
                            <h3 className={clsx("text-title-medium", style.tableContainerHeadline)}>Tabel Expense</h3>
                            {isNoneSelectedRow() && isWindowSizeExpanded() && (
                                <ButtonFilled onClick={handleOpenExpenseAddForm}>
                                    Tambah
                                </ButtonFilled>
                            )}
                            {isSingleSelectedRow() && isWindowSizeExpanded() && (
                                <>
                                    <Link href={`/expense/${selectedRows[0].id}`} passHref legacyBehavior>
                                        <LinkText>
                                            Lihat
                                        </LinkText>
                                    </Link>
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
                            {isManySelectedRow() && isWindowSizeExpanded() && (
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
                                                    <MenuItem onClick={handleOpenExpenseDeleteMany}>Hapus</MenuItem>
                                                </li>
                                            </ul>
                                        </Menu>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={style.tableContainerBody}>
                            <Table table={table} />
                        </div>
                    </div>
                </div>
            </div>
            {budget && (
                <BudgetUpdateForm 
                    budget={budget}
                    open={openBudgetUpdateForm}
                    onOpenChange={setOpenBudgetUpdateForm}
                />
            )}
            {budget && (
                <BudgetDelete
                    budget={budget}
                    open={openBudgetDelete}
                    onOpenChange={setOpenBudgetDelete}
                    onSuccess={() => router.push("/budget")}
                />
            )}
            <ExpenseAddForm 
                open={openExpenseAddForm} 
                onOpenChange={setOpenExpenseAddForm}
                budgetCode={budget.code}
                disableBudgetSelection={true}
            />
            {isSingleSelectedRow() && (
                <ExpenseUpdateForm
                    expense={selectedRows[0]}
                    open={openExpenseUpdateForm}
                    onOpenChange={setOpenExpenseUpdateForm}
                    onSuccess={(data) => table.resetRowSelection()}
                    disableBudgetSelection={true}
                />
            )}
            {isSingleSelectedRow() && (
                <ExpenseDelete
                    expense={selectedRows[0]}
                    open={openExpenseDelete}
                    onOpenChange={setOpenExpenseDelete}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            {isManySelectedRow() && (
                <ExpenseDeleteMany
                    expenses={selectedRows}
                    open={openExpenseDeleteMany}
                    onOpenChange={setOpenExpenseDeleteMany}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            {isWindowSizeSpanMedium() && createPortal(
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
                            <ul>
                                <li>
                                    <MenuItem onClick={handleOpenBudgetUpdateForm}>Edit Budget</MenuItem>
                                </li>
                                <li>
                                    <MenuItem onClick={handleOpenBudgetDelete}>Hapus Budget</MenuItem>
                                </li>
                                <li>
                                    <MenuItem onClick={handleExportBudgetTransactions}>Export</MenuItem>
                                </li>
                            </ul>
                        </Menu>
                    )}
                </div>,
                toolbarRef.current
            )}
            {isSingleSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    <>
                        <IconButtonStandard onClick={() => router.push(`/expense/${selectedRows[0].id}`)}>
                            <IconEye />
                        </IconButtonStandard>
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
                )
            )}
            {isManySelectedRow() && isWindowSizeSpanMedium() && createPortal(
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
                                    <MenuItem onClick={handleOpenExpenseDeleteMany}>Hapus</MenuItem>
                                </li>
                            </ul>
                        </Menu>
                    )}
                </div>,
                toolbarSecondaryRef.current
            )}
            {!isNoneSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    selectedRows.length,
                    headlineSecondaryRef.current
                )
            )}
            <Fab 
                ref={fabRef}
                open={openFab && isNoneSelectedRow()}
                onOpenChange={setOpenFab}
                onClick={handleOpenExpenseAddForm}
                onShow={() => {
                    if (fabRef.current instanceof HTMLElement) {
                        const rect = fabRef.current.getBoundingClientRect();
                        setSnackbarStyle({ bottom: `calc(${window.innerHeight - rect.top}px + 1rem)` });
                    }
                }}
                onClose={() => setSnackbarStyle(null)}
            >
                <IconPlusLg />
            </Fab>
        </>
    );
}