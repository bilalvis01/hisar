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
import { GET_BUDGETS } from "../../graphql-documents";
import Table from "../Table";
import { LinkText } from "../../components/ButtonText";
import Link from "next/link";
import BudgetAddForm from "../budget-add-form/BudgetAddForm";
import style from "./BudgetCard.module.scss";
import ProgressCircular from "../../components/ProgressCircular";

interface Budget {
    name: string;
    code: string;
    budget: number;
    expense: number;
    balance: number;
}

const columnHelper = createColumnHelper<Budget>();

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
    columnHelper.accessor("name", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>NAMA</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                <Link href={`budget/${info.row.original.code}`} passHref legacyBehavior>
                    <LinkText>
                        {info.getValue()}
                    </LinkText>
                </Link>
            </span>
        ),
    }),
    columnHelper.accessor("budget", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                BUDGET
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-small")}>
                {idr.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("expense", {
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
    columnHelper.accessor("balance", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                SISA
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-small")}>
                {idr.format(info.getValue())}
            </span>
        ),
    })
];

export default function BudgetTable() {
    const { loading, error, data } = useQuery(GET_BUDGETS);

    const budgets = data ? data.budgets : [];

    const table = useReactTable({
        data: budgets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

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
                <h2 className={clsx("text-headline-medium", style.headline)}>BUDGET</h2>
                <div className={style.toolbar}>
                    <BudgetAddForm />
                </div>
            </header>
            <div className={style.body}>
                <Table table={table} />
            </div>
        </div>
    );
}