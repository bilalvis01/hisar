import { PrismaClient } from "@prisma/client";
import { 
    createBudgetTransactionProcedure, 
    deleteBudgetTransactionProcedure,
    deleteBudgetTransactionManyProcedure,
    changeBudgetTransactionAmountProcedure,
    changeBudgetTransactionDescriptionProcedure,
    changeBudgetTransactionHostProcedure,
} from "./budget-transaction-procedures";
import { balanceLedgerProcedure } from "./common-procedures";
import { BUDGET_EXPENSE } from "./budget-transaction-type";
import { BUDGET_EXPENSE_ACCOUNT_CODE } from "./account-code";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT,
} from "./budget-account-task";
import * as accountCode from "../utils/accountCode";

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
        id: string; 
        budgetCode: string;
        description: string; 
        amount: bigint; 
    }
) {
    const transactionId = parseInt(id);

    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id: transactionId,
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
        await changeExpenseBudgetHostProcedure(client, {
            idTransaction: budgetTransaction.id,
            budgetCode,
        });
    }

    if (currentExpenseAmount !== amount) {
        await changeExpenseAmountProcedure(client, { id: transactionId, amount });
    }

    if (budgetTransaction.description != description) { 
        await changeExpenseDescriptionProcedure(client, { id: transactionId, description });
    }

    return await client.budgetTransaction.findUnique({
        where: {
            id: transactionId,
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
    data: { ids: number[] }, 
) {
    return await deleteBudgetTransactionManyProcedure(client, data);
}

export async function changeExpenseAmountProcedure(
    client: PrismaClient,
    {
        id,
        amount,
    }: {
        id: number;
        amount: bigint;
    }
) {
    return await changeBudgetTransactionAmountProcedure(client, {
        id,
        amount,
    });
}

export async function changeExpenseDescriptionProcedure(
    client: PrismaClient,
    {
        id,
        description,
    }: {
        id: number,
        description: string,
    }
) {
    await changeBudgetTransactionDescriptionProcedure(client, {
        id,
        description,
    });
}

export async function changeExpenseBudgetHostProcedure(
    client: PrismaClient,
    data: { idTransaction: number; budgetCode: string; }
) {
    await changeBudgetTransactionHostProcedure(client, data);
}