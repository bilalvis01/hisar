"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import idr from "../../../lib/utils/idr";
import Checkbox from "../../../ui/react/Checkbox";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_BUDGET_BY_CODE } from "../../../lib/graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../../lib/graphql/budget-transaction-documents";
import Table from "../table/Table";
import { useParams } from "next/navigation";
import style from "./BudgetDetailCard.module.scss";
import ProgressCircular from "../../../ui/react/ProgressCircular";
import BudgetUpdateForm from "../budget-update-form/BudgetUpdateForm";
import BudgetDelete from "../budget-delete/BudgetDelete";
import { useTemplateContext } from "../../context/TemplateProvider";
import { useRouter, notFound } from "next/navigation";
import { ButtonText } from "../../../ui/react/ButtonText";
import { IconButtonFilled } from "../../../ui/react/IconButtonFilled";
import IconPencil from "../../../lib/icons/Pencil";
import Link from "next/link";
import { LinkText } from "../../../ui/react/ButtonText";
import { BudgetTransaction } from "../../../lib/graphql/generated/graphql";
import ExpenseDelete from "../expense-delete/ExpenseDelete";
import ExpenseUpdateForm from "../expense-update-form/ExpenseUpdateForm";
import ExpenseAddForm from "../expense-add-form/ExpenseAddForm";
import ButtonFilled from "../../../ui/react/ButtonFIlled";
import { Menu, MenuItem } from "../../../ui/react/Menu";
import { IconButtonStandard } from "../../../ui/react/IconButtonStandard";
import IconThreeDotsVertial from "../../../lib/icons/ThreeDotsVertical";
import { 
    useFloating, 
    useClick, 
    useInteractions, 
    useDismiss, 
    offset,
    autoUpdate,
} from "@floating-ui/react";
import Fab from "../fab/Fab";
import IconPlusLg from "../../../lib/icons/PlusLg";
import IconEye from "../../../lib/icons/Eye";
import date from "../../../lib/utils/date";
import { BUDGET_EXPENSE } from "../../../lib/database/budget-transaction-type";
import { POLL_INTERVAL } from "../../../lib/graphql/pollInterval";
import BudgetExportForm from "../budget-export-form/BudgetExportForm";
import { RECORD_NOT_FOUND } from "../../../lib/graphql/error-code";

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
            <span className={clsx("description", "text-body-medium")}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("description", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DESKRIPSI </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-medium")}>
                 <Link href={`/anggaran/${info.row.original.budgetCode}/${info.row.original.id}`} passHref legacyBehavior>
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
            <span className={clsx("currency", "text-body-medium")}>
                {info.row.original.transactionType === BUDGET_EXPENSE && (
                    idr.format(info.getValue())
                )}
            </span>
        ),
    }),
    columnHelper.accessor("balance", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                SELISIH
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-medium")}>
                {idr.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("createdAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DIBUAT</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-medium")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("updatedAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DIPERBARUI</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-medium")}>
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
        variables: { input: { code } },
        pollInterval: POLL_INTERVAL,
    });
    const { 
        loading: budgetTransactionsLoading, 
        error: budgetTransactionsError, 
        data: budgetTransactionData, 
    } = useQuery(GET_BUDGET_TRANSACTIONS, {
        variables: { input: { budgetCode: code } },
        pollInterval: POLL_INTERVAL,
    });
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
        setInfo,
    } = useTemplateContext();
    const [openBudgetUpdateForm, setOpenBudgetUpdateForm] = React.useState(false);
    const [openBudgetDelete, setOpenBudgetDelete] = React.useState(false);
    const [openExpenseAddForm, setOpenExpenseAddForm] = React.useState(false);
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const [openExpenseDelete, setOpenExpenseDelete] = React.useState(false);
    const [openBudgetExportForm, setOpenBudgetExportForm] = React.useState(false);
    const router = useRouter();
    const [rowSelection, setRowSelection] = React.useState({});
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const [openFab, setOpenFab] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: openActionsMenu,
        onOpenChange: setOpenActionsMenu,
        placement: "bottom-end",
        middleware: [offset(4)],
        whileElementsMounted: autoUpdate,
    });
    const fabRef = React.useRef(null);

    const clickActionsMenu = useClick(context);
    const dismissActionsMenu = useDismiss(context);

    const { getFloatingProps, getReferenceProps } = useInteractions([
        clickActionsMenu,
        dismissActionsMenu,
    ]);

    const budget = budgetData ? budgetData.budgetByCode : null; 
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

    const handleOpenBudgetExportForm = React.useCallback(() => {
        setOpenBudgetExportForm(true);
    }, []);

    const handleBack = React.useCallback(() => {
        router.back();
    }, [router]);

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

        return () => removeClickCloseAppBarSecondaryEventListener();
    }, [windowSize, selectedRows.length]);

    if (budgetLoading || budgetTransactionsLoading) return (
        <>
            <div className={clsx(style.placeholder)}>
                <ProgressCircular />
            </div>
        </>
    );

    if (
        budgetError && 
        budgetError.graphQLErrors.some(
            (error) => error.extensions.code === RECORD_NOT_FOUND
        )
    ) {
        notFound();
    }

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
                        <>
                            <ButtonText onClick={handleBack}>Kembali</ButtonText>
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
                                        <MenuItem onClick={handleOpenBudgetUpdateForm}>Edit Anggaran</MenuItem>
                                        <MenuItem onClick={handleOpenBudgetDelete}>Hapus Anggaran</MenuItem>
                                        <MenuItem progress={exporting} onClick={handleOpenBudgetExportForm}>Export</MenuItem>
                                    </Menu>
                                )}
                            </div>
                        </>
                    )}
                </header>
                <div className={style.body}>
                    {budget && (
                        <>
                            <h3 className={clsx("text-title-medium")}>Informasi Umum</h3>
                            <ul className={style.description}>
                                <li className={style.descriptionItem}>
                                    <div className="text-title-small">Kode</div>
                                    <div className="text-body-medium">{budget.code}</div>
                                </li>
                                <li className={style.descriptionItem}>
                                    <div className="text-title-small">Nama</div>
                                    <div className="text-body-medium">{budget.name}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Dibuat</div>
                                    <div className="text-body-medium">{date.format(budget.createdAt)}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Diperbarui</div>
                                    <div className="text-body-medium">{date.format(budget.updatedAt)}</div>
                                </li>
                            </ul>
                            <hr className={style.divider} />
                            <h3 className={clsx("text-title-medium")}>Deskripsi</h3>
                            <div className={style.budgetDescription}>
                                <p className="text-body-medium">{budget.description}</p>
                            </div>
                            <hr className={style.divider} />
                            <h3 className={clsx("text-title-medium")}>Ringkasan Anggaran</h3>
                            <ul className={style.description}>
                                <li>
                                    <div className="text-title-small">Anggaran</div>
                                    <div className="text-body-medium">{idr.format(budget.amount)}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Realisasi Anggaran</div>
                                    <div className="text-body-medium">{idr.format(budget.expense)}</div>
                                </li>
                                <li>
                                    <div className="text-title-small">Selisih Anggaran</div>
                                    <div className="text-body-medium">{idr.format(budget.balance)}</div>
                                </li>
                            </ul>
                        </>
                    )}
                    <hr className={style.divider} />
                    <div className={style.tableContainer}>
                        <div className={style.tableContainerHeader}>
                            <h3 className={clsx("text-title-medium", style.tableContainerHeadline)}>Biaya-biaya</h3>
                            {isNoneSelectedRow() && isWindowSizeExpanded() && (
                                <ButtonFilled onClick={handleOpenExpenseAddForm}>
                                    Tambah
                                </ButtonFilled>
                            )}
                            {isSingleSelectedRow() && isWindowSizeExpanded() && (
                                <>
                                    <Link href={`/biaya-biaya/${selectedRows[0].id}`} passHref legacyBehavior>
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
                                                <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
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
                                            <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
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
                    budgets={[budget]}
                    open={openBudgetDelete}
                    onOpenChange={setOpenBudgetDelete}
                    onSuccess={() => router.push("/anggaran")}
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
            {!isNoneSelectedRow() && (
                <ExpenseDelete
                    expenses={selectedRows}
                    open={openExpenseDelete}
                    onOpenChange={setOpenExpenseDelete}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            {budget && (
                <BudgetExportForm 
                    budgets={[budget]}
                    open={openBudgetExportForm}
                    onOpenChange={setOpenBudgetExportForm}
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
                            <MenuItem onClick={handleOpenBudgetUpdateForm}>Edit Anggaran</MenuItem>
                            <MenuItem onClick={handleOpenBudgetDelete}>Hapus Anggaran</MenuItem>
                            <MenuItem progress={exporting} onClick={handleOpenBudgetExportForm}>Export</MenuItem>
                            <MenuItem onClick={handleBack}>Kembali</MenuItem>
                        </Menu>
                    )}
                </div>,
                toolbarRef.current
            )}
            {isSingleSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    <>
                        <IconButtonStandard onClick={() => router.push(`/biaya-biaya/${selectedRows[0].id}`)}>
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
                                    <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
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
                            <MenuItem onClick={handleOpenExpenseDelete}>Hapus</MenuItem>
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