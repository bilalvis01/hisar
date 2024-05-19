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
import BudgetDelete from "../budget-delete/BudgetDelete";
import BudgetUpdateForm from "../budget-update-form/BudgetUpdateForm";
import { Budget } from "../../graphql-tag/graphql";
import { ButtonText } from "../../components/ButtonText";
import { useTemplateContext } from "../Template";
import IconTrash from "../../icons/Trash";
import IconPencil from "../../icons/Pencil";
import IconEye from "../../icons/Eye";
import { useRouter } from "next/navigation";
import { IconButtonStandard } from "../../components/IconButtonStandard";
import BudgetDeleteMany from "../budget-delete-many/BudgetDeleteMany";
import date from "../../utils/date";

interface Row {
    name: string;
    code: string;
    budget: number;
    expense: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
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
    columnHelper.accessor("code", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>KODE</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {info.getValue()}
            </span>
        ),
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
    }),
    columnHelper.accessor("createdAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DIBUAT</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
    columnHelper.accessor("updatedAt", {
        header: () => (
            <span className={clsx("description", "text-title-small")}>DIPERBARUI</span>
        ),
        cell: info => (
            <span className={clsx("description", "text-body-small")}>
                {date.format(info.getValue())}
            </span>
        ),
    }),
];

export default function BudgetTable() {
    const { loading, error, data } = useQuery(GET_BUDGETS);
    const [openFab, setOpenFab] = React.useState(false);
    const [openBudgetAddForm, setOpenBudgetAddForm] = React.useState(false);
    const [openBudgetUpdateForm, setOpenBudgetUpdateForm] = React.useState(false);
    const [openBudgetDelete, setOpenBudgetDelete] = React.useState(false);
    const [openBudgetDeleteMany, setOpenBudgetDeleteMany] = React.useState(false);
    const fabRef = React.useRef(null);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { 
        toolbarRef,
        toolbarSecondaryRef, 
        headlineSecondaryRef,
        setShowCompactWindowSizeAppBarSecondary,
        setSnackbarStyle,
        isWindowSizeCompact,
        isWindowSizeMedium,
        isWindowSizeExpanded,
        isWindowSizeSpanMedium,
        addClickCloseAppBarSecondaryEventListener,
        removeClickCloseAppBarSecondaryEventListener,
        windowSize,
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

    const isNoneSelectedRow = React.useCallback(() => {
        return selectedRows.length === 0;
    }, [selectedRows.length]);

    const isSingleSelectedRow = React.useCallback(() => {
        return selectedRows.length === 1;
    }, [selectedRows.length]);

    const isManySelectedRow = React.useCallback(() => {
        return selectedRows.length >= 2;
    }, [selectedRows.length]);

    const handleOpenBudgetAddForm = React.useCallback(() => {
        setOpenBudgetAddForm(true);
    }, []);

    const handleOpenBudgetUpdateForm = React.useCallback(() => {
        setOpenBudgetUpdateForm(true);
    }, []);

    const handleOpenBudgetDelete = React.useCallback(() => {
        setOpenBudgetDelete(true);
    }, []);

    const handleOpenBudgetDeleteMany = React.useCallback(() => {
        setOpenBudgetDeleteMany(true);
    }, []);

    React.useEffect(() => {
        if (!isNoneSelectedRow() && isWindowSizeSpanMedium()) {
            setShowCompactWindowSizeAppBarSecondary(true);
            addClickCloseAppBarSecondaryEventListener(() => {
                table.resetRowSelection();
                setShowCompactWindowSizeAppBarSecondary(false);
            });
        } else {
            setShowCompactWindowSizeAppBarSecondary(false);
        }

        () => removeClickCloseAppBarSecondaryEventListener();
    }, [windowSize, selectedRows.length]);

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
                {isNoneSelectedRow() && (isWindowSizeExpanded() || isWindowSizeMedium()) && (
                    <ButtonFilled onClick={handleOpenBudgetAddForm}>
                        Buat Budget
                    </ButtonFilled>
                )}
                {isSingleSelectedRow() && isWindowSizeExpanded() && (
                    <>
                        <Link href={`/budget/${selectedRows[0].code}`} passHref legacyBehavior>
                            <LinkText>
                                Lihat
                            </LinkText>
                        </Link>
                        <ButtonText onClick={handleOpenBudgetUpdateForm}>
                            Edit
                        </ButtonText>
                        <ButtonText onClick={handleOpenBudgetDelete}>
                            Hapus
                        </ButtonText>
                    </>
                )}
                {isManySelectedRow() && isWindowSizeExpanded() && (
                    <ButtonText onClick={handleOpenBudgetDeleteMany}>
                        Hapus
                    </ButtonText>
                )}
            </header>
            <div className={style.body}>
                <Table table={table} />
            </div>
            <BudgetAddForm 
                open={openBudgetAddForm} 
                onOpenChange={setOpenBudgetAddForm} 
            />
            {isSingleSelectedRow() && (
                <BudgetUpdateForm
                    budget={selectedRows[0] as Budget}
                    open={openBudgetUpdateForm}
                    onOpenChange={setOpenBudgetUpdateForm}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            {isSingleSelectedRow() && (
                <BudgetDelete
                    budget={selectedRows[0] as Budget}
                    open={openBudgetDelete}
                    onOpenChange={setOpenBudgetDelete}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            {isManySelectedRow() && (
                <BudgetDeleteMany
                    budgets={selectedRows as Budget[]}
                    open={openBudgetDeleteMany}
                    onOpenChange={setOpenBudgetDeleteMany}
                    onSuccess={(data) => table.resetRowSelection()}
                />
            )}
            <Fab 
                ref={fabRef} 
                open={openFab && isNoneSelectedRow()}
                onOpenChange={setOpenFab}
                onClick={handleOpenBudgetAddForm} 
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
            {isSingleSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    <>
                        <IconButtonStandard onClick={() => router.push(`/budget/${selectedRows[0].code}`)}>
                            <IconEye />
                        </IconButtonStandard>
                        <IconButtonStandard onClick={handleOpenBudgetUpdateForm}>
                            <IconPencil />
                        </IconButtonStandard>
                        <IconButtonStandard onClick={handleOpenBudgetDelete}>
                            <IconTrash />
                        </IconButtonStandard>
                    </>,
                    toolbarSecondaryRef.current
                )
            )}
            {isManySelectedRow() && isWindowSizeSpanMedium() && createPortal(
                <IconButtonStandard onClick={handleOpenBudgetDeleteMany}>
                    <IconTrash />
                </IconButtonStandard>,
                toolbarSecondaryRef.current
            )}
            {!isNoneSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    selectedRows.length,
                    headlineSecondaryRef.current
                )
            )}
        </div>
    );
}