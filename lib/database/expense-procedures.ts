import { PrismaClient } from "@prisma/client";
import { 
    createBudgetTransactionProcedure, 
    deleteBudgetTransactionProcedure,
    changeBudgetTransactionAmountProcedure,
    changeBudgetTransactionDescriptionProcedure
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
            budget: {
                include: {
                    accountAssignments: {
                        include: {
                            account: {
                                include: {
                                    accountCode: {
                                        include: {
                                            parent: true,
                                        },
                                    },
                                },
                            },
                            task: true,
                        },
                    },
                },
            },
        },
    });

    const budgetCashAccount = budgetTransaction.budget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];

    const currentBudgetCode = 
        `${budgetCashAccount.accountCode.parent.code}-${accountCode.format(budgetCashAccount.accountCode.code)}`;

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
    data: { id: string },
) {
    return await deleteBudgetTransactionProcedure(client, data);
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
    {
        idTransaction,
        budgetCode: rawBudgetCode,
    }: {
        idTransaction: number,
        budgetCode: string,
    }
) {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id: idTransaction,
        },
        include: {
            journal: {
                include: {
                    entries: {
                        include: {
                            ledger: {
                                include: {
                                    account: {
                                        include: {
                                            budgetAccountAssignment: {
                                                include: {
                                                    task: true,
                                                },
                                            },
                                        },
                                    },
                                }
                            }
                        },
                    },
                },
            },
        },
    });

    const budgetCode = accountCode.split(rawBudgetCode);

    const newBudgetHost = await client.budget.findFirst({
        include: {
            accountAssignments: {
                include: {
                    account: {
                        include: {
                            ledgers: {
                                where: {
                                    open: true,
                                    softDeleted: false,
                                },
                            },
                        },
                    },
                    task: true,
                },
            },
        },
        where: {
            accountAssignments: {
                some: {
                    account: {
                        accountCode: {
                            code: budgetCode[1],
                            parent: {
                                code: budgetCode[0],
                            },
                        },
                    },  
                },
            },
        },
    });

    const newBudgetHostCashAccount = newBudgetHost.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];

    const newBudgetHostExpenseAccount = newBudgetHost.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0]["account"];

    await client.budgetTransaction.update({
        data: {
            budget: { connect: { id: newBudgetHost.id } },
        },
        where: {
            id: budgetTransaction.id,
        },
    });

    await Promise.all(budgetTransaction.journal.entries.map(async (entry) => {
        let newLedgerId;
        
        if (
            entry.ledger.account.budgetAccountAssignment.task.name === BUDGET_CASH_ACCOUNT
        ) {
            newLedgerId = newBudgetHostCashAccount.ledgers[0].id;
        }

        if (
            entry.ledger.account.budgetAccountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT
        ) {
            newLedgerId = newBudgetHostExpenseAccount.ledgers[0].id;
        }

        await client.entry.update({
            data: {
                ledger: { connect: { id: newLedgerId } }
            },
            where: {
                id: entry.id,
            },
        });

        await balanceLedgerProcedure(client, { id: entry.ledger.id });
        await balanceLedgerProcedure(client, { id: newLedgerId });
    }));
}