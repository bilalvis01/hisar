import { PrismaClient } from "@prisma/client";
import expenseID from "../utils/expenseID";
import { BUDGET_EXPENSE_ACCOUNT_CODE } from "../database/account-code";
import { BUDGET_EXPENSE, BUDGET_FUNDING } from "../database/budget-transaction-type";
import { fetchBudgetTransactionById } from "./budget-transaction-fetching";

export async function fetchExpenseById(client: PrismaClient, { id }: { id: number }) {
    return await fetchBudgetTransactionById(client, { id, transactionType: BUDGET_EXPENSE });
}

export async function fetchExpensesByIds(client: PrismaClient, { ids }: { ids: number[]; }) {
    return await Promise.all(ids.map(
        async (id) => await fetchBudgetTransactionById(client, { id, transactionType: BUDGET_EXPENSE })
    ));
};