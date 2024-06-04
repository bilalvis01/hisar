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
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_BUDGETS } from "../../graphql/budget-documents";
import Table from "../table/Table";
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
import { Budget } from "../../graphql/generated/graphql";
import { ButtonText } from "../../components/ButtonText";
import { useTemplateContext } from "../Template";
import IconPencil from "../../icons/Pencil";
import IconEye from "../../icons/Eye";
import { useRouter } from "next/navigation";
import { IconButtonStandard } from "../../components/IconButtonStandard";
import date from "../../utils/date";
import IconThreeDotsVertial from "../../icons/ThreeDotsVertical";
import { Menu, MenuItem } from "../../components/Menu";
import { 
    useFloating, 
    useClick, 
    useInteractions, 
    useDismiss, 
    offset,
    autoUpdate,
} from "@floating-ui/react";
import { POLL_INTERVAL } from "../../graphql/pollInterval";
import BudgetExportForm from "../budget-export-form/BudgetExportForm";

const columnHelper = createColumnHelper<Omit<Budget, "__typedef" | "transactions">>();

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
    columnHelper.accessor("amount", {
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
    const { loading, error, data } = useQuery(GET_BUDGETS, {
        pollInterval: POLL_INTERVAL,
    });
    const [openFab, setOpenFab] = React.useState(false);
    const [openBudgetAddForm, setOpenBudgetAddForm] = React.useState(false);
    const [openBudgetUpdateForm, setOpenBudgetUpdateForm] = React.useState(false);
    const [openBudgetDelete, setOpenBudgetDelete] = React.useState(false);
    const [openBudgetExportForm, setOpenBudgetExportForm] = React.useState(false);
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
        setInfo,
        windowSize,
    } = useTemplateContext();
    const router = useRouter();
    const [openActionsMenu, setOpenActionsMenu] = React.useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: openActionsMenu,
        onOpenChange: setOpenActionsMenu,
        placement: "bottom-end",
        middleware: [offset(4)],
        whileElementsMounted: autoUpdate,
    });

    const clickActionsMenu = useClick(context);
    const dismissActionsMenu = useDismiss(context);

    const { getFloatingProps, getReferenceProps } = useInteractions([
        clickActionsMenu,
        dismissActionsMenu,
    ]);

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

    const handleOpenBudgetExportForm = React.useCallback(() => {
        setOpenBudgetExportForm(true);
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
                {isNoneSelectedRow() && isWindowSizeExpanded() && (
                    <ButtonFilled onClick={handleOpenBudgetAddForm}>
                        Buat Budget
                    </ButtonFilled>
                )}
                {!isNoneSelectedRow() && isWindowSizeExpanded() && (
                    <>
                        {isSingleSelectedRow() && (
                            <>
                                <Link href={`/budget/${selectedRows[0].code}`} passHref legacyBehavior>
                                    <LinkText>
                                        Lihat
                                    </LinkText>
                                </Link>
                                <ButtonText onClick={handleOpenBudgetUpdateForm}>
                                    Edit
                                </ButtonText>
                            </>
                        )}
                        <div>
                            <IconButtonStandard {...getReferenceProps()} ref={refs.setReference}>
                                <IconThreeDotsVertial />
                            </IconButtonStandard>
                            {openActionsMenu && (
                                <Menu 
                                    {...getFloatingProps()} 
                                    ref={refs.setFloating} 
                                    style={floatingStyles} 
                                    className={style.actionsMenu}
                                >
                                    <ul>
                                        <li>
                                            <MenuItem onClick={handleOpenBudgetExportForm}>Export</MenuItem>
                                        </li>
                                        <li>
                                            <MenuItem onClick={handleOpenBudgetDelete}>Hapus</MenuItem>
                                        </li>
                                    </ul>
                                </Menu>
                            )}
                        </div>
                    </>
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
            {!isNoneSelectedRow() && (
                <BudgetDelete
                    budgets={selectedRows}
                    open={openBudgetDelete}
                    onOpenChange={setOpenBudgetDelete}
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
            {!isNoneSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    <>
                        {isSingleSelectedRow() && (
                            <>
                                <IconButtonStandard onClick={() => router.push(`/budget/${selectedRows[0].code}`)}>
                                    <IconEye />
                                </IconButtonStandard>
                                <IconButtonStandard onClick={handleOpenBudgetUpdateForm}>
                                    <IconPencil />
                                </IconButtonStandard>  
                            </>
                        )}
                        <div>
                            <IconButtonStandard {...getReferenceProps()} ref={refs.setReference}>
                                <IconThreeDotsVertial />
                            </IconButtonStandard>
                            {openActionsMenu && (
                                <Menu 
                                    {...getFloatingProps()} 
                                    ref={refs.setFloating} 
                                    style={floatingStyles} 
                                    className={style.actionsMenu}
                                >
                                    <ul>
                                        <li>
                                            <MenuItem onClick={handleOpenBudgetExportForm}>Export</MenuItem>
                                        </li>
                                        <li>
                                            <MenuItem onClick={handleOpenBudgetDelete}>Hapus</MenuItem>
                                        </li>
                                    </ul>
                                </Menu>
                            )}
                        </div>
                    </>,
                    toolbarSecondaryRef.current
                )
            )}
            {!isNoneSelectedRow() && isWindowSizeSpanMedium() && (
                createPortal(
                    selectedRows.length,
                    headlineSecondaryRef.current
                )
            )}
            {!isNoneSelectedRow() && (
                <BudgetExportForm 
                    budgets={selectedRows}
                    open={openBudgetExportForm}
                    onOpenChange={setOpenBudgetExportForm}
                    onSuccess={() => table.resetRowSelection()}
                />
            )}
        </div>
    );
}