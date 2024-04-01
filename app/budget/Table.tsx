"use client";

import React from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import style from "./table.module.scss";

interface Budget {
    deskripsi: string;
    budget: number;
    terpakai: number;
    sisa: number;
}

const defaultData: Budget[] = [
    {
        deskripsi: "Budget A",
        budget: 1_000_000,
        terpakai: 300_000,
        sisa: 700_000,
    },
    {
        deskripsi: "Budget B",
        budget: 2_000_000,
        terpakai: 300_000,
        sisa: 1_700_000,
    },
    {
        deskripsi: "Budget C",
        budget: 300_000,
        terpakai: 100_000,
        sisa: 200_000,
    },
];

const columnHelper = createColumnHelper<Budget>();

const columns = [
    columnHelper.accessor("deskripsi", {
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("budget", {
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("terpakai", {
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("sisa", {
        cell: info => info.getValue(),
    })
];

export default function Table() {
    const [data, setData] = React.useState([...defaultData]);
    const rerender = React.useReducer(() => ({}), {})[1];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className={style.wrapper}>
            <table className={style.table}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr className={style.head} key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th className={style.headCell} key={header.id}>
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
                        <tr className={style.body} key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td className={style.bodyCell} key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}