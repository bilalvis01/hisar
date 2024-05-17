"use client";

import React from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
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

interface Expense {
    description: string;
    budgetAccount: string;
    budgetAccountId: number;
    amount: number;
}

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
    columnHelper.accessor("description", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DESKRIPSI</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {info.getValue()}
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
];

export default function ExpenseTable() {
    const { loading, error, data } = useQuery(GET_EXPENSES);
    const [openForm, setOpenForm] = React.useState(false);
    const fabRef = React.useRef(null);
    const { setSnackbarStyle } = useTemplateContext();

    const expenses = data ? data.expenses : [];

    const table = useReactTable({
        data: expenses,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    const handleOpenForm = React.useCallback(() => {
        setOpenForm(true)
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
                <div className={style.toolbar}>
                    <ButtonFilled onClick={handleOpenForm}>
                        Tambah
                    </ButtonFilled>
                </div>
            </header>
            <div className={style.body}>
                <Table table={table} />
            </div>
            <ExpenseAddForm 
                open={openForm} 
                onOpenChange={setOpenForm} 
            />
            <Fab 
                ref={fabRef}
                onClick={handleOpenForm}
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