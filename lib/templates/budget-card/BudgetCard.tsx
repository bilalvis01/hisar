"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
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
import ButtonFilled from "../../components/ButtonFIlled";
import Fab from "../fab/Fab";
import IconPlusLg from "../../icons/PlusLg";
import Snackbar from "../snackbar/Snackbar";
import BudgetDelete from "../budget-delete/BudgetDelete";
import BudgetUpdateForm from "../budget-update-form/BudgetUpdateForm";
import { Budget } from "../../graphql-tag/graphql";
import { ButtonText } from "../../components/ButtonText";
import { useTemplateContext } from "../Template";
import IconTrash from "../../icons/Trash";
import IconButtonFilled from "../../components/IconButtonFilled";
import Pencil from "../../icons/Pencil";
import Eye from "../../icons/Eye";
import { useRouter } from "next/navigation";

interface Row {
    name: string;
    code: string;
    budget: number;
    expense: number;
    balance: number;
}

const columnHelper = createColumnHelper<Row>();

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
                <Link href={`/budget/${info.row.original.code}`} passHref legacyBehavior>
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
    const [openBudgetAddForm, setOpenBudgetAddForm] = React.useState(false);
    const [openBudgetUpdateForm, setOpenBudgetUpdateForm] = React.useState(false);
    const [openBudgetDelete, setOpenBudgetDelete] = React.useState(false);
    const [info, setInfo] = React.useState<string | null>(null);
    const [snackbarStyle, setSnackbarStyle] = React.useState<React.CSSProperties | null>(null);
    const fabRef = React.useRef(null);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { 
        toolbarSecondaryRef, 
        setShowCompactScreenAppBarSecondary, 
        showCompactScreenAppBarSecondary,
        screen 
    } = useTemplateContext();
    const router = useRouter();

    const budgets = data ? data.budgets : [];

    const table = useReactTable({
        data: budgets,
        columns,
        getRowId: (budget) => budget.code,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        }
    });

    const selectedRows = table.getSelectedRowModel()
        .rows
        .map((row) => row.original);

    const handleOpenForm = React.useCallback(() => {
        setOpenBudgetAddForm(true);
    }, []);

    const handleOpenBudgetUpdateForm = React.useCallback(() => {
        setOpenBudgetUpdateForm(true);
    }, []);

    const handleOpenBudgetDelete = React.useCallback(() => {
        setOpenBudgetDelete(true);
    }, []);

    React.useEffect(() => {
        if (selectedRows.length > 0 && (screen === "compact" || screen === "medium")) {
            setShowCompactScreenAppBarSecondary(true);
        } else {
            setShowCompactScreenAppBarSecondary(false);
        }
    }, [screen, selectedRows.length])

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
                <h2 className={clsx("text-title-large", style.headline)}>BUDGET</h2>
                <div className={style.toolbar}>
                    <ButtonFilled onClick={handleOpenForm}>
                        Buat Budget
                    </ButtonFilled>
                    {selectedRows.length === 1 && screen === "expanded" && (
                        <Link href={`/budget/${selectedRows[0].code}`} passHref legacyBehavior>
                            <LinkText>
                                Lihat
                            </LinkText>
                        </Link>
                    )}
                    {selectedRows.length === 1 && screen === "expanded" && (
                        <ButtonText onClick={handleOpenBudgetUpdateForm}>
                            Edit
                        </ButtonText>
                    )}
                    {selectedRows.length === 1 && screen === "expanded" && (
                        <ButtonText onClick={handleOpenBudgetDelete}>
                            Hapus
                        </ButtonText>
                    )}
                </div>
            </header>
            <div className={style.body}>
                <Table table={table} />
            </div>
            <BudgetAddForm 
                open={openBudgetAddForm} 
                onOpenChange={setOpenBudgetAddForm} 
                onSuccess={(data) => setInfo(data.createBudget.message)} 
            />
            {selectedRows.length === 1 && (
                <BudgetUpdateForm
                    budget={selectedRows[0] as Budget}
                    open={openBudgetUpdateForm}
                    onOpenChange={setOpenBudgetUpdateForm}
                    onSuccess={(data) => setInfo(data.updateBudget.message)}
                />
            )}
            {selectedRows.length === 1 && (
                <BudgetDelete
                    budget={selectedRows[0] as Budget}
                    open={openBudgetDelete}
                    onOpenChange={setOpenBudgetDelete}
                    onSuccess={(data) => setInfo(data.deleteBudget.message)}
                />
            )}
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
            <Snackbar open={!!info} onClose={() => setInfo(null)} style={snackbarStyle}>
                {info}
            </Snackbar>
            {selectedRows.length === 1 && (
                createPortal(
                    <>
                        <IconButtonFilled 
                            onClick={() => {
                                setShowCompactScreenAppBarSecondary(false);
                                router.push(`/budget/${selectedRows[0].code}`);
                            }}
                        >
                            <Eye />
                        </IconButtonFilled>
                        <IconButtonFilled onClick={handleOpenBudgetUpdateForm}>
                            <Pencil />
                        </IconButtonFilled>
                        <IconButtonFilled onClick={handleOpenBudgetDelete}>
                            <IconTrash />
                        </IconButtonFilled>
                    </>,
                    toolbarSecondaryRef.current
                )
            )}
        </div>
    );
}