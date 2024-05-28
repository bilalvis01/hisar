import * as XLXS from "xlsx";
import { BudgetTransaction } from "../graphql/generated/graphql";

export function exportBudgetTransactions(data: BudgetTransaction[]) {
    const rows = data.map((item) => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        balance: item.balance,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));

    const maxWidthIdColumn = rows.reduce(
        (w, r) => Math.max(w, r.id.length),
        10
    );

    const maxWidthDescriptionColumn = rows.reduce(
        (w, r) => Math.max(w, r.description.length),
        10
    );

    const maxWidthAmountColumn = rows.reduce(
        (w, r) => Math.max(w, r.amount.toString().length),
        10
    );

    const maxWidthBalanceColumn = rows.reduce(
        (w, r) => Math.max(w, r.balance.toString().length),
        10
    );

    const maxWidthCreatedAtColumn = rows.reduce(
        (w, r) => Math.max(w, r.createdAt.length),
        10
    );

    const maxWidthUpdatedAtColumn = rows.reduce(
        (w, r) => Math.max(w, r.updatedAt.length),
        10
    );

    const worksheet = XLXS.utils.json_to_sheet(rows);

    worksheet["!cols"] = [ 
        { wch: maxWidthIdColumn }, 
        { wch: maxWidthDescriptionColumn },
        { wch: maxWidthAmountColumn },
        { wch: maxWidthBalanceColumn },
        { wch: maxWidthCreatedAtColumn },
        { wch: maxWidthUpdatedAtColumn },
    ];

    XLXS.utils.sheet_add_aoa(
        worksheet, 
        [["ID", "Deskripsi", "Terpakai", "Saldo", "Dibuat", "Diperbarui"]],
        { origin: "A1" },
    );

    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, worksheet, "Budget Expenses");

    XLXS.writeFile(workbook, "BudgetTransactions.xlsx", { compression: true });
}