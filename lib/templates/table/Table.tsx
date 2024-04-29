"use client";

import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import ProgressCircular from "../../components/ProgressCircular";
import style from "./Table.module.scss";

interface TableProps<Column> {
    loading: boolean,
    success: boolean,
    message: string,
    table: Table<Column>;
};

export default function Table<Column>({ loading, success, message, table }: TableProps<Column>) {
    if (loading) return <div className={style.placeholder}><ProgressCircular /></div>;
    if (!success) return <div className={style.placeholder}>{message}</div>;

    return (
        <>
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
        </>
    );
}