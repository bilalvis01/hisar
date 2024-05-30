import { PrismaClient } from "@prisma/client";
import { 
    createBudgetTransactionProcedure, 
    deleteBudgetTransactionProcedure,
    deleteBudgetTransactionManyProcedure,
    changeBudgetTransactionAmountProcedure,
    changeBudgetTransactionDescriptionProcedure,
    changeBudgetTransactionHostProcedure,
} from "./budget-transaction-procedures";
import { BUDGET_EXPENSE } from "./budget-transaction-type";
import { BUDGET_EXPENSE_ACCOUNT_CODE } from "./account-code";

export async function createExpenseProcedure(
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
    return await createBudgetTransactionProcedure(client, {
        id: budgetId,
        description,
        amount,
        transactionType: BUDGET_EXPENSE,
    });
}

export async function updateExpenseProcedure(
    client: PrismaClient, 
    { 
        id,
        budgetCode,
        description, 
        amount 
    }: { 
        id: number; 
        budgetCode: string;
        description: string; 
        amount: bigint; 
    }
) {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id,
        },
        include: {
            journal: {
                include: {
                    entries: {
                        where: {
                            ledger: {
                                account: {
                                    accountCode: {
                                        parent: {
                                            code: BUDGET_EXPENSE_ACCOUNT_CODE,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            budget: true,
        },
    });

    const currentBudgetCode = budgetTransaction.budget.code;

    const currentExpenseAmount = budgetTransaction.journal.entries[0].amount;

    if (currentBudgetCode !== budgetCode) {
        await changeExpenseBudgetHostProcedure(client, { id, budgetCode });
    }

    if (currentExpenseAmount !== amount) {
        await changeExpenseAmountProcedure(client, { id, amount });
    }

    if (budgetTransaction.description != description) { 
        await changeExpenseDescriptionProcedure(client, { id, description });
    }

    return await client.budgetTransaction.findUnique({
        where: {
            id,
        },
    });
}

export async function deleteExpenseProcedure(
    client: PrismaClient,
    data: { id: number },
) {
    return await deleteBudgetTransactionProcedure(client, data);
}

export async function deleteExpenseManyProcedure(
    client: PrismaClient,
    data: { transactions: { id: number; transactionType: string; }[] }, 
) {
    return await deleteBudgetTransactionManyProcedure(client, data);
}

export async function changeExpenseAmountProcedure(
    client: PrismaClient,
    data: { id: number; amount: bigint; }
) {
    return await changeBudgetTransactionAmountProcedure(client, 
        { ...data, ...{ transactionType: BUDGET_EXPENSE } }
    );
}

export async function changeExpenseDescriptionProcedure(
    client: PrismaClient,
    data: { id: number, description: string }
) {
    await changeBudgetTransactionDescriptionProcedure(client, 
        { ...data, ...{ transactionType: BUDGET_EXPENSE } }
    );
}

export async function changeExpenseBudgetHostProcedure(
    client: PrismaClient,
    data: { id: number; budgetCode: string; }
) {
    await changeBudgetTransactionHostProcedure(client, 
        { ...data, ...{ transactionType: BUDGET_EXPENSE } }
    );
}