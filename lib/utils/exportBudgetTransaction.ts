import * as XLXS from "xlsx";
import { Budget, BudgetTransaction } from "../graphql/generated/graphql";
import { LazyQueryExecFunction } from "@apollo/client";
import { GetBudgetTransactionsQuery, GetBudgetTransactionsQueryVariables } from "../graphql/generated/graphql";
import { BUDGET_FUNDING } from "../database/budget-transaction-type";
import { SortOrder } from "../graphql/generated/graphql";

const CURRENCY_FORMAT = '"Rp."#,##0.00_);\\("$"#,##0.00\\)';
const DATE_FORMAT = "dd/mm/yyyy hh:mm:ss";

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
            variables: { input: { budgetCode: budget.code, sortOrder: SortOrder.Asc } }
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
        const worksheet = createBudgetTransactionWorksheet(budget, rawBudgetTransactions);

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
            variables: { 
                input: { budgetCode: budget.code, sortOrder: SortOrder.Asc },
            },
        });

        const worksheet = createBudgetTransactionWorksheet(budget, data.budgetTransactions);

        return { budgetName: budget.name, worksheet };
    }));

    const workbook = XLXS.utils.book_new();

    worksheets.forEach(({ budgetName, worksheet }) => {
        XLXS.utils.book_append_sheet(workbook, worksheet, `${budgetName}`);
    });

    XLXS.writeFile(workbook, `Budget Expenses.xlsx`, { compression: true });
}

function createBudgetTransactionWorksheet(budget: Budget, rawBudgetTransactions: BudgetTransaction[]) {
    const budgetTransactionRows = rawBudgetTransactions.map(
        (rawBudgetTransaction) => reshapeBudgetTransaction(rawBudgetTransaction)
    );

    const maxWidthDescriptionColumn = budgetTransactionRows.reduce(
        (w, r) => Math.max(w, r.description.length),
        10
    );

    const worksheet = XLXS.utils.json_to_sheet(budgetTransactionRows, { origin: "A2" });

    XLXS.utils.sheet_add_aoa(
        worksheet, 
        [
            [`${budget.name}`],
            ["Dibuat", "Diperbarui", "Deskripsi", "Budget", "Terpakai", "Saldo"]
        ],
        { origin: "A1" },
    );

    worksheet["!cols"] = [ 
        { wch: 20 },
        { wch: 20 },
        { wch: maxWidthDescriptionColumn },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
    ];

    worksheet["!rows"] = [
        { hpt: 20 },
    ],

    worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    ];

    for (let i = 0; i < budgetTransactionRows.length; i++) {
        const rowIndex = i + 3;

        worksheet[`A${rowIndex}`].z = DATE_FORMAT;
        worksheet[`B${rowIndex}`].z = DATE_FORMAT;
        worksheet[`D${rowIndex}`].z = CURRENCY_FORMAT;
        worksheet[`E${rowIndex}`].z = CURRENCY_FORMAT;
        worksheet[`F${rowIndex}`].z = CURRENCY_FORMAT;
    }

    return worksheet;
}

function reshapeBudgetTransaction(budgetTransaction: BudgetTransaction) {
    const common = {
        createdAt: new Date(budgetTransaction.createdAt),
        updatedAt: new Date(budgetTransaction.updatedAt),
        description: budgetTransaction.description,
        budget: null,
        expanse: null,
        balance: budgetTransaction.balance,
    };

    if (budgetTransaction.transactionType === BUDGET_FUNDING) {
        return { ...common, ...{ budget: budgetTransaction.amount } };
    }

    return { ...common, ...{ expanse: budgetTransaction.amount } };
}