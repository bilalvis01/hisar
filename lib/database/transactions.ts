import { 
    PrismaClient,
} from "@prisma/client";
import { 
    BUDGET_EXPENSE_ACCOUNT_CODE,
    CASH_ACCOUNT_CODE,
} from "./account-code";
import { 
    createBudgetProcedure,
    deleteBudgetProcedure,
    deleteBudgetManyProcedure,
    updateBudgetProcedure,
} from "./budget-procedures"
import {
    createExpenseProcedure,
    updateExpenseProcedure,
    deleteExpenseProcedure,
    deleteExpenseManyProcedure,
} from "./expense-procedures";
import { createJournalProcedure } from "./journal-procedures";

const DEBIT = 1;
const CREDIT = -1;

export async function journalize(
    client: PrismaClient,
    {
        debitAccountId,
        creditAccountId,
        amount,
        description,
    }: {
        debitAccountId: number, 
        creditAccountId: number, 
        amount: bigint, 
        description: string
    }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await createJournalProcedure(tx, { 
            debitAccountId,
            creditAccountId,
            amount, 
            description,
        });
    });
}

export async function createBudget(
    client: PrismaClient, 
    { name, amount }: { name: string; amount: bigint }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await createBudgetProcedure(tx, { name, amount });
    });
}

export async function updateBudget(
    client: PrismaClient, 
    data: { id: number; name: string; amount: bigint; }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return updateBudgetProcedure(tx, data);
    });
}

export async function deleteBudget(client: PrismaClient, { id }: { id: number }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await deleteBudgetProcedure(tx, { id });
    });
} 

export async function deleteBudgetMany(client: PrismaClient, data: { ids: number[] }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await deleteBudgetManyProcedure(tx, data);
    });
} 

export async function createExpense(
    client: PrismaClient,
    {
        budgetId,
        description,
        amount,
    }: {
        budgetId: number,
        description: string,
        amount: bigint,
    }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await createExpenseProcedure(tx, { budgetId, description, amount });
    });
}

export async function updateExpense(
    client: PrismaClient, 
    data: { 
        id: string; 
        budgetCode: string;
        description: string; 
        amount: bigint; 
    }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await updateExpenseProcedure(tx, data);
    });
}

export async function deleteExpense(
    client: PrismaClient, 
    data: { id: number }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await deleteExpenseProcedure(tx, data);
    });
}

export async function deleteExpenseMany(
    client: PrismaClient, 
    data: { ids: number[] }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await deleteExpenseManyProcedure(tx, data);
    });
}