"use client";

import React from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import style from "./BudgetTable.module.scss";
import format from "../../utils/format";
import Checkbox from "../../components/Checkbox";
import { useQuery } from "@apollo/client";
import { gql } from "../../graphql-tag";

interface Budget {
    name: string;
    budget?: number;
    expense?: number;
    balance?: number;
}

const columnHelper = createColumnHelper<Budget>();

const columns = [
    columnHelper.display({
        id: "select",
        header: ({ table }) => (
            <IndeterminateCheckbox 
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
            />
        ),
        cell: ({ row }) => (
            <div className={style.select}>
                <IndeterminateCheckbox 
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
            <span className={clsx(style.description, "text-title-small")}>DESKRIPSI</span>
        ),
        cell: info => (
            <span className={clsx(style.description, "text-body-small")}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("budget", {
        header: () => (
            <span className={clsx(style.currency, "text-title-small")}>
                BUDGET
            </span>
        ),
        cell: info => (
            <span className={clsx(style.currency, "text-body-small")}>
                {format.currency(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("expense", {
        header: () => (
            <span className={clsx(style.currency, "text-title-small")}>
                TERPAKAI
            </span>
        ),
        cell: info => (
            <span className={clsx(style.currency, "text-body-small")}>
                {format.currency(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("balance", {
        header: () => (
            <span className={clsx(style.currency, "text-title-small")}>
                SISA
            </span>
        ),
        cell: info => (
            <span className={clsx(style.currency, "text-body-small")}>
                {format.currency(info.getValue())}
            </span>
        ),
    })
];

const GET_BUDGETS = gql(/* GraphQL */ `
    query GetBudget {
        budgets {
            name
            budget
            expense
            balance
        }
    }
`);

export default function Table() {
    const { loading, error, data } = useQuery(GET_BUDGETS);

    const budgets = data ? data.budgets : [];

    const table = useReactTable({
        data: budgets,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <table className={style.table}>
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className={style.head}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className={style.cell}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )
                                }
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}  className={style.body}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className={style.cell}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function IndeterminateCheckbox({
    className = "",
    ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
    const ref = React.useRef<HTMLInputElement>(null!);

    return (
        <Checkbox
            type="checkbox"
            ref={ref}
            className={className}
            {...rest}
        />
    )
}