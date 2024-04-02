"use client";

import React from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
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
    columnHelper.accessor("deskripsi", {
        header: "DESKRIPSI",
        cell: info => (
            <span className={style.description}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("budget", {
        header: "BUDGET",
        cell: info => (
            <span className={style.currency}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("terpakai", {
        header: "TERPAKAI",
        cell: info => (
            <span className={style.currency}>
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("sisa", {
        header: "SISA",
        cell: info => (
            <span className={style.currency}>
                {info.getValue()}
            </span>
        ),
    })
];

export default function Table() {
    const [data, setData] = React.useState([...defaultData]);
    const rerender = React.useReducer(() => ({}), {})[1];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    return (
        <div className={style.wrapper}>
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
        </div>
    );
}

function IndeterminateCheckbox({
    indeterminate,
    className = "",
    ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
    const ref = React.useRef<HTMLInputElement>(null!);

    React.useEffect(() => {
        if (typeof indeterminate === "boolean") {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate])

    return (
        <input 
            type="checkbox"
            ref={ref}
            className={clsx(className, style.cursorPointer)}
            {...rest}
        />
    )
}