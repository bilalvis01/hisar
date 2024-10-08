"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
} from "@tanstack/react-table";
import clsx from "clsx";
import idr from "../../../lib/utils/idr";
import Checkbox from "../../../ui/react/Checkbox";
import { useQuery } from "@apollo/client";
import { GET_BUDGET_TRANSACTIONS } from "../../../lib/graphql/budget-transaction-documents";
import Table from "../table/Table";
import ExpenseAddForm from "../expense-add-form/ExpenseAddForm";
import style from "./ExpenseCard.module.scss";
import ProgressCircular from "../../../ui/react/ProgressCircular";
import ButtonFilled from "../../../ui/react/ButtonFIlled";
import Fab from "../fab/Fab";
import IconPlusLg from "../../../lib/icons/PlusLg";
import { useTemplateContext } from "../../context/TemplateProvider";
import Link from "next/link";
import { LinkText } from "../../../ui/react/ButtonText";
import date from "../../../lib/utils/date";
import ExpenseUpdateForm from "../expense-update-form/ExpenseUpdateForm";
import { BudgetTransaction } from "../../../lib/graphql/generated/graphql";
import { ButtonText } from "../../../ui/react/ButtonText";
import ExpenseDelete from "../expense-delete/ExpenseDelete";
import { IconButtonStandard } from "../../../ui/react/IconButtonStandard";
import IconEye from "../../../lib/icons/Eye";
import IconPencil from "../../../lib/icons/Pencil";
import { useRouter } from "next/navigation";
import { BUDGET_EXPENSE } from "../../../lib/database/budget-transaction-type";
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
import { POLL_INTERVAL } from "../../../lib/graphql/pollInterval";

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
        )
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
            <span className={clsx("description", "text-title-small")}>DESKRIPSI</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                <Link href={`/biaya-biaya/${info.row.original.id}`} passHref legacyBehavior>
                    <LinkText>
                        {info.getValue()}
                    </LinkText>
                </Link>
            </span>
        ),
    }),
    columnHelper.accessor("budgetName", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>
                ANGGARAN
            </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                <Link href={`/anggaran/${info.row.original.budgetCode}`} passHref legacyBehavior>
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
                {idr.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("createdAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>
                DIBUAT
            </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("updatedAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>
                DIPERBARUI
            </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
];

export default function ExpenseTable() {
    const { loading, error, data } = useQuery(GET_BUDGET_TRANSACTIONS, {
        variables: { input: { transactionType: BUDGET_EXPENSE } },
        pollInterval: POLL_INTERVAL,
    });
    const [openExpenseAddForm, setOpenExpenseAddForm] = React.useState(false);
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const [openExpenseDelete, setOpenExpenseDelete] = React.useState(false);
    const fabRef = React.useRef(null);
    const { 
        setSnackbarStyle, 
        toolbarSecondaryRef,
        headlineSecondaryRef,
        isWindowSizeCompact,
        isWindowSizeMedium,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
        setShowCompactWindowSizeAppBarSecondary,
        addClickCloseAppBarSecondaryEventListener,
        removeClickCloseAppBarSecondaryEventListener,
        windowSize,
    } = useTemplateContext();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const router = useRouter();
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const [openFab, setOpenFab] = React.useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: openActionsMenu,
        onOpenChange: setOpenActionsMenu,
        placement: "bottom-end",
        middleware: [offset(4)],
        whileElementsMounted: autoUpdate,
    });

    const clickActionsMenu = useClick(context);
    const dismissActionsMenu = useDismiss(context);

    const { getFloatingProps, getReferenceProps } = useInteractions([
        clickActionsMenu,
        dismissActionsMenu,
    ]);

    const expenses = data 
        ? data.budgetTransactions
        : [];

    const table = useReactTable({
        data: expenses,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        }
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

    const handleOpenExpenseAddForm = React.useCallback(() => {
        setOpenExpenseAddForm(true)
    }, []);

    const handleOpenExpenseUpdateForm = React.useCallback(() => {
        setOpenExpenseUpdateForm(true);
    }, []);

    const handleOpenExpenseDelete = React.useCallback(() => {
        setOpenExpenseDelete(true);
    }, []);

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


    if (loading) return (
        <div className={clsx(style.placeholder)}>
            <ProgressCircular />
        </div>
    );

    if (error) return (
        <div className={clsx(style.placeholder)}>
            {error.message}
        </div>
    );

    return (
        <div className={style.card}>
            <header className={style.header}>
                <h2 className={clsx("text-title-large", style.headline)}>BIAYA-BIAYA</h2>
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
            </header>
            <div className={style.body}>
                <Table table={table} />
            </div>
            <ExpenseAddForm 
                open={openExpenseAddForm} 
                onOpenChange={setOpenExpenseAddForm}
            />
            {isSingleSelectedRow() && (
                <ExpenseUpdateForm
                    expense={selectedRows[0]}
                    open={openExpenseUpdateForm}
                    onOpenChange={setOpenExpenseUpdateForm}
                    onSuccess={(data) => table.resetRowSelection()}
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
        </div>
    );
}