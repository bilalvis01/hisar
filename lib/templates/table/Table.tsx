"use client";

import React from "react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import clsx from "clsx";

interface TableProps<Column> {
    table: Table<Column>;
    className?: string;
};

export default function Table<Column>({ table, className }: TableProps<Column>) {
    return (
        <>
            <table className={clsx("table", className)}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                let className = header.column.id === "select"
                                    ? "selection"
                                    : null;

                                return (
                                    <th key={header.id} className={className}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        }
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => {
                                let className = cell.column.id === "select"
                                    ? "selection"
                                    : null;

                                return (
                                    <td key={cell.id} className={className}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}