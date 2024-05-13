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
import { GET_BUDGET_BY_CODE } from "../../graphql-documents";
import Table from "../Table";
import { useParams } from "next/navigation";
import style from "./BudgetDetailCard.module.scss";
import * as date from "date-fns";
import ProgressCircular from "../../components/ProgressCircular";

interface Budget {
    description: string;
    debit?: number;
    credit?: number;
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
    columnHelper.accessor("description", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DESKIPSI </span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("debit", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                DEBIT
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-small")}>
                {!info.getValue() && "-"}
                {info.getValue() && idr.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("credit", {
        header: () => (
            <span className={clsx("currency", "text-title-small")}>
                CREDIT
            </span>
        ),
        cell: info => (
            <span className={clsx("currency", "text-body-small")}>
                {!info.getValue() && "-"}
                {info.getValue() && idr.format(info.getValue())}
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
    })
];

export default function BudgetDetail() {
    const { code } = useParams<{ code: string }>();
    const { loading, error, data } = useQuery(GET_BUDGET_BY_CODE, {
        variables: { code }
    });

    const budgets = data ? data.budgetByCode.expenseDetail : [];

    const table = useReactTable({
        data: budgets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    if (loading) return (
        <div className={clsx(style.card, style.placeholder)}>
            <ProgressCircular />
        </div>
    );

    return (
        <div className={style.card}>
            <header className={style.header}>
                <h2 className={clsx("text-headline-medium", style.headline)}>
                    {data && data.budgetByCode.name.toUpperCase()}
                </h2>
            </header>
            <div className={style.body}>
                {data && (
                    <ul className={style.description}>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">Kode Akun</div>
                            <div className="text-body-small">{data.budgetByCode.code}</div>
                        </li>
                        <li className={style.descriptionItem}>
                            <div className="text-title-small">Nama Akun</div>
                            <div className="text-body-small">{data.budgetByCode.name}</div>
                        </li>
                        <li>
                            <div className="text-title-small">Total Budget</div>
                            <div className="text-body-small">{idr.format(data.budgetByCode.budget)}</div>
                        </li>
                        <li>
                            <div className="text-title-small">Total Expense</div>
                            <div className="text-body-small">{idr.format(data.budgetByCode.expense)}</div>
                        </li>
                        <li>
                            <div className="text-title-small">Saldo Terakhir</div>
                            <div className="text-body-small">{idr.format(data.budgetByCode.balance)}</div>
                        </li>
                        <li>
                            <div className="text-title-small">Dibuat</div>
                            <div className="text-body-small">{date.format(data.budgetByCode.createdAt, "d-M-y")}</div>
                        </li>
                        <li>
                            <div className="text-title-small">Diperbarui</div>
                            <div className="text-body-small">{date.format(data.budgetByCode.updatedAt, "d-M-y")}</div>
                        </li>
                    </ul>
                )}
                <h3 className={clsx("text-title-small", style.tableTitle)}>Expenses</h3>
                <Table table={table} />
            </div>
        </div>
    );
}