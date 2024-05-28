import * as XLXS from "xlsx";
import { Budget, BudgetTransaction } from "../graphql/generated/graphql";

export function exportBudgetTransactions(rawBudget: Budget, rawBudgetTransaction: BudgetTransaction[]) {
    const budgetTransactionRows = rawBudgetTransaction.map((item) => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        balance: item.balance,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));

    const maxWidthIdColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.id.length),
        10
    );

    const maxWidthDescriptionColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.description.length),
        10
    );

    const maxWidthAmountColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.amount.toString().length),
        10
    );

    const maxWidthBalanceColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.balance.toString().length),
        10
    );

    const maxWidthCreatedAtColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.createdAt.length),
        10
    );

    const maxWidthUpdatedAtColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.updatedAt.length),
        10
    );

    const budgetTransactionWorksheet = XLXS.utils.json_to_sheet(budgetTransactionRows);

    budgetTransactionWorksheet["!cols"] = [ 
        { wch: maxWidthIdColumn }, 
        { wch: maxWidthDescriptionColumn },
        { wch: maxWidthAmountColumn },
        { wch: maxWidthBalanceColumn },
        { wch: maxWidthCreatedAtColumn },
        { wch: maxWidthUpdatedAtColumn },
    ];

    XLXS.utils.sheet_add_aoa(
        budgetTransactionWorksheet, 
        [["ID", "Deskripsi", "Terpakai", "Saldo", "Dibuat", "Diperbarui"]],
        { origin: "A1" },
    );

    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, budgetTransactionWorksheet, "Expenses");

    XLXS.writeFile(workbook, `${rawBudget.name}.xlsx`, { compression: true });
}