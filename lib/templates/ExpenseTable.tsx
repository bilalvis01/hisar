"use client";

import React from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import format from "../utils/format";
import Checkbox from "../components/Checkbox";
import { useQuery } from "@apollo/client";
import { gql } from "../graphql-tag";

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
                {format.currency(info.getValue())}
            </span>
        ),
    }),
];

const GET_EXPENSES = gql(/* GraphQL */ `
    query GetExpenses {
        expenses {
            id
            description
            budgetAccount
            budgetAccountId
            amount
        }
    }
`);

export default function Table() {
    const { loading, error, data } = useQuery(GET_EXPENSES);

    const expenses = data ? data.expenses : [];

    const table = useReactTable({
        data: expenses,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <table className="table">
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
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
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}