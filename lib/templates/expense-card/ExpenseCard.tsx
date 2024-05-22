"use client";

import React from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
} from "@tanstack/react-table";
import clsx from "clsx";
import idr from "../../utils/idr";
import Checkbox from "../../components/Checkbox";
import { useQuery } from "@apollo/client";
import { GET_EXPENSES } from "../../graphql-documents";
import Table from "../Table";
import ExpenseAddForm from "../expense-add-form/ExpenseAddForm";
import style from "./ExpenseCard.module.scss";
import ProgressCircular from "../../components/ProgressCircular";
import ButtonFilled from "../../components/ButtonFIlled";
import Fab from "../fab/Fab";
import IconPlusLg from "../../icons/PlusLg";
import { useTemplateContext } from "../Template";
import Link from "next/link";
import { LinkText } from "../../components/ButtonText";
import date from "../../utils/date";
import ExpenseUpdateForm from "../expense-update-form/ExpenseUpdateForm";
import { Expense } from "../../graphql/graphql";
import { ButtonText } from "../../components/ButtonText";

const columnHelper = createColumnHelper<Expense>();

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
    columnHelper.accessor("code", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>KODE</span>
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
                <Link href={`/expense/${info.row.original.code}`} passHref legacyBehavior>
                    <LinkText>
                        {info.getValue()}
                    </LinkText>
                </Link>
            </span>
        ),
    }),
    columnHelper.accessor("budgetAccount", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>
                BUDGET
            </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {info.getValue()}
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
    const { loading, error, data } = useQuery(GET_EXPENSES);
    const [openExpenseAddForm, setOpenExpenseAddForm] = React.useState(false);
    const [openExpenseUpdateForm, setOpenExpenseUpdateForm] = React.useState(false);
    const fabRef = React.useRef(null);
    const { 
        setSnackbarStyle, 
        isWindowSizeCompact,
        isWindowSizeMedium,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
    } = useTemplateContext();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const expenses = data ? data.expenses : [];

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
                <h2 className={clsx("text-title-large", style.headline)}>EXPENSE</h2>
                {isNoneSelectedRow() && (isWindowSizeExpanded() || isWindowSizeMedium()) && (
                    <ButtonFilled onClick={handleOpenExpenseAddForm}>
                        Tambah
                    </ButtonFilled>
                )}
                {isSingleSelectedRow() && isWindowSizeExpanded() && (
                    <>
                        <Link href={`/expense/${selectedRows[0].code}`} passHref legacyBehavior>
                            <LinkText>
                                Lihat
                            </LinkText>
                        </Link>
                        <ButtonText onClick={handleOpenExpenseUpdateForm}>
                            Edit
                        </ButtonText>
                    </>
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
                    expense={selectedRows[0] as Expense}
                    open={openExpenseUpdateForm}
                    onOpenChange={setOpenExpenseUpdateForm}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            <Fab 
                ref={fabRef}
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
        </div>
    );
}