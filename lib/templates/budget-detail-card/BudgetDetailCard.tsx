"use client";

import React from "react";
import { createPortal } from "react-dom";
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
import BudgetUpdateForm from "../budget-update-form/BudgetUpdateForm";
import BudgetDelete from "../budget-delete/BudgetDelete";
import { useTemplateContext } from "../Template";
import IconButtonFilled from "../../components/IconButtonFilled";
import IconThreeDotsVertial from "../../icons/ThreeDotsVertical";
import { Menu, MenuItem } from "../../components/Menu";
import ButtonFilled from "../../components/ButtonFIlled";
import { useRouter, notFound } from "next/navigation";

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

export default function BudgetDetailCard() {
    const { code } = useParams<{ code: string }>();
    const { loading, error, data } = useQuery(GET_BUDGET_BY_CODE, {
        variables: { code }
    });
    const { toolbarRef, screen, setInfo } = useTemplateContext();
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const [openBudgetUpdateForm, setOpenBudgetUpdateForm] = React.useState(false);
    const [openBudgetDelete, setOpenBudgetDelete] = React.useState(false);
    const router = useRouter();

    if (data && data.budgetByCode.code === 404) {
        notFound();
    }

    const expenseDetail = data ? data.budgetByCode.budget.expenseDetail : [];
    const budget = data ? data.budgetByCode.budget : null; 

    const table = useReactTable({
        data: expenseDetail,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    const handleOpenBudgetUpdateForm = React.useCallback(() => {
        setOpenActionsMenu(false);
        setOpenBudgetUpdateForm(true);
    }, []);

    const handleOpenBudgetDelete = React.useCallback(() => {
        setOpenActionsMenu(false);
        setOpenBudgetDelete(true);
    }, []);

    React.useEffect(() => {
        if (screen === "expanded") setOpenActionsMenu(false);
    }, [screen]);

    if (loading) return (
        <>
            <div className={clsx(style.placeholder)}>
                <ProgressCircular />
            </div>
            <div className={clsx(style.placeholder)}>
                <ProgressCircular />
            </div>
        </>
    );

    if (error) return (
        <div className={clsx(style.placeholder)}>
            {error.message}
        </div>
    );

    return (
        <>
            <div className={style.card}>
                <header className={style.header}>
                    <h2 className={clsx("text-title-large", style.headline)}>
                        {budget && budget.name.toUpperCase()}
                    </h2>
                    <div className={style.toolbar}>
                        <ButtonFilled onClick={handleOpenBudgetUpdateForm}>
                            Update
                        </ButtonFilled>
                        <ButtonFilled onClick={handleOpenBudgetDelete}>
                            Delete
                        </ButtonFilled>
                    </div>
                </header>
                <div className={style.body}>
                    {budget && (
                        <ul className={style.description}>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Kode Akun</div>
                                <div className="text-body-small">{budget.code}</div>
                            </li>
                            <li className={style.descriptionItem}>
                                <div className="text-title-small">Nama Akun</div>
                                <div className="text-body-small">{budget.name}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Total Budget</div>
                                <div className="text-body-small">{idr.format(budget.budget)}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Total Expense</div>
                                <div className="text-body-small">{idr.format(budget.expense)}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Saldo Terakhir</div>
                                <div className="text-body-small">{idr.format(budget.balance)}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Dibuat</div>
                                <div className="text-body-small">{date.format(budget.createdAt, "d-M-y H:m:s")}</div>
                            </li>
                            <li>
                                <div className="text-title-small">Diperbarui</div>
                                <div className="text-body-small">{date.format(budget.updatedAt, "d-M-y H:m:s")}</div>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
            <div className={style.card}>
                <header className={style.header}>
                    <h2 className={clsx("text-title-large", style.headline)}>
                        EXPENSE
                    </h2>
                </header>
                <div className={style.body}>
                    <Table table={table} />
                </div>
            </div>
            {budget && (
                <BudgetUpdateForm 
                    open={openBudgetUpdateForm}
                    onOpenChange={setOpenBudgetUpdateForm}
                    code={code} 
                    name={budget.name} 
                    balance={budget.balance} 
                    onSuccess={(data) => setInfo(data.updateBudget.message)}
                />
            )}
            {budget && (
                <BudgetDelete
                    budget={budget}
                    open={openBudgetDelete}
                    onOpenChange={setOpenBudgetDelete}
                    onSuccess={(data) => {
                        setInfo(data.deleteBudget.message);
                        router.push("/budget");
                    }}
                />
            )}
            {data && toolbarRef.current instanceof HTMLDivElement && createPortal(
                <div className={style.actionsMenuContainer}>
                    <IconButtonFilled onClick={() => setOpenActionsMenu(!openActionsMenu)}>
                        <IconThreeDotsVertial />
                    </IconButtonFilled>
                    <Menu className={style.actionsMenu} style={{ display: openActionsMenu ? "block" : "none" }}>
                        <ul>
                            <li>
                                <MenuItem onClick={handleOpenBudgetUpdateForm}>
                                    Edit
                                </MenuItem>
                            </li>
                            <li>
                                <MenuItem onClick={handleOpenBudgetDelete}>
                                    Hapus
                                </MenuItem>
                            </li>
                        </ul>
                    </Menu>
                </div>,
                toolbarRef.current
            )}
        </>
    );
}