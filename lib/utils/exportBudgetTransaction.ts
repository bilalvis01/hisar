import * as XLXS from "xlsx";
import { Budget, BudgetTransaction } from "../graphql/generated/graphql";
import { LazyQueryExecFunction } from "@apollo/client";
import { GetBudgetTransactionsQuery, GetBudgetTransactionsQueryVariables } from "../graphql/generated/graphql";

type GetBudgetTransactionsQueryExecFn = LazyQueryExecFunction<GetBudgetTransactionsQuery, GetBudgetTransactionsQueryVariables>;

export async function exportBudgetTransactions(
    {
        budget: budget,
        budgetTransactions: rawBudgetTransactionsParam,
        getBudgetTransactions: getRawBudgetTransactions,
    }:
    {
        budget: Budget, 
        budgetTransactions?: BudgetTransaction[],
        getBudgetTransactions?: GetBudgetTransactionsQueryExecFn,
    }
) {
    if (!rawBudgetTransactionsParam && !getRawBudgetTransactions) {
        return;
    }

    let rawBudgetTransactions;
    let error;
    let loading;

    if (!rawBudgetTransactionsParam) {
        const { data, error: getRawBudgetTransactionsError } = await getRawBudgetTransactions({
            variables: { input: { budgetCode: budget.code } }
        });

        if (data) {
            rawBudgetTransactions = data.budgetTransactions; 
        }

        if (error) {
            error = getRawBudgetTransactionsError;
        }
    } else {
        rawBudgetTransactions = rawBudgetTransactionsParam;
    }

    if (rawBudgetTransactions) {
        const worksheet = createBudgetTransactionWorksheet(rawBudgetTransactions);

        const workbook = XLXS.utils.book_new();

        XLXS.utils.book_append_sheet(workbook, worksheet, "Expenses");

        XLXS.writeFile(workbook, `${budget.name}.xlsx`, { compression: true });
    }

    return { error }
}

export async function exportBudgetTransactionsMany(
    {
        budgets,
        getBudgetTransactions: getRawBudgetTransactions
    }:
    {
        budgets: Budget[];
        getBudgetTransactions: GetBudgetTransactionsQueryExecFn;
    }
) {
    const worksheets = await Promise.all(budgets.map(async (budget) => {
        const { data } = await getRawBudgetTransactions({ 
            variables: { input: { budgetCode: budget.code } } 
        });

        const worksheet = createBudgetTransactionWorksheet(data.budgetTransactions);

        return { budgetName: budget.name, worksheet };
    }));

    const workbook = XLXS.utils.book_new();

    worksheets.forEach(({ budgetName, worksheet }) => {
        XLXS.utils.book_append_sheet(workbook, worksheet, `${budgetName}`);
    });

    XLXS.writeFile(workbook, `Budget Expenses.xlsx`, { compression: true });
}

function createBudgetTransactionWorksheet(rawBudgetTransactions: BudgetTransaction[]) {
    const budgetTransactionRows = rawBudgetTransactions.map(
        (rawBudgetTransaction) => reshapeBudgetTransaction(rawBudgetTransaction)
    );

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

    const worksheet = XLXS.utils.json_to_sheet(budgetTransactionRows);

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

    return worksheet;
}

function reshapeBudgetTransaction(budgetTransaction: BudgetTransaction) {
    return {
        id: budgetTransaction.id,
        description: budgetTransaction.description,
        amount: budgetTransaction.amount,
        balance: budgetTransaction.balance,
        createdAt: budgetTransaction.createdAt,
        updatedAt: budgetTransaction.updatedAt,
    };
}