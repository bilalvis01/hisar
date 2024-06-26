import { 
    PrismaClient,
    BudgetTransaction, 
    Entry,
} from "@prisma/client";
import { 
    BUDGET_CASH_ACCOUNT,
    BUDGET_EXPENSE_ACCOUNT,
} from "./budget-account-task";
import { 
    createJournalProcedure,
    updateJournalAmountProcedure,
    deleteJournalProcedure,
} from "./journal-procedures";
import { balancingLedgerProcedure } from "./common-procedures";
import * as accountCode from "../utils/accountCode";
import { number } from "yup";

export async function createBudgetTransactionProcedure(
    client: PrismaClient,
    { 
        id,
        description,
        amount,
        transactionType,
    }: {
        id: number,
        description: string,
        amount: bigint,
        transactionType: string,
    }
) {
    const budget = await client.budget.findUnique({
        where: {
            id,
        },
        include: {
            accountAssignments: {
                include: {
                    account: true,
                    task: true,
                },
            },
        },
    });

    const budgetCashAccount = budget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT 
    )[0].account;

    const budgetExpenseAccount = budget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0].account;

    const journal = await createJournalProcedure(client, {
        debitAccountId: budgetExpenseAccount.id,
        creditAccountId: budgetCashAccount.id,
        description: `${description} (${budget.name})`,
        amount,
    });

    const newBudgetTransaction = await client.budgetTransaction.create({
        data: {
            budget: { connect: { id: budget.id } },
            journal: { connect: { id: journal.id } },
            transactionType: { connect: { name: transactionType } },
            description,
        },
    });

    await client.budget.update({
        data: {
            updatedAt: newBudgetTransaction.createdAt,
        },
        where: {
            id: newBudgetTransaction.budgetId,  
        },
    });
    
    return newBudgetTransaction;
}

export async function changeBudgetTransactionHostProcedure(
    client: PrismaClient,
    {
        id,
        budgetCode: rawBudgetCode,
        transactionType,
    }: {
        id: number;
        budgetCode: string;
        transactionType?: string;
    }
) {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id,
            transactionType: { name: transactionType },
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

    if (!budgetTransaction) {
        return;
    }

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
                                    deletedAt: null,
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

    const updatedBudgetTransaction = await client.budgetTransaction.update({
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

        await balancingLedgerProcedure(client, { id: entry.ledger.id });
        await balancingLedgerProcedure(client, { id: newLedgerId });
    }));

    await client.budget.updateMany({
        data: {
            updatedAt: updatedBudgetTransaction.updatedAt,
        },
        where: {
            id: {
                in: [budgetTransaction.budgetId, newBudgetHost.id],
            },
        },
    });
}

export async function changeBudgetTransactionAmountProcedure(
    client: PrismaClient,
    {
        id,
        amount,
        transactionType,
    }: {
        id: number;
        amount: bigint;
        transactionType?: string;
    }
) {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id,
            transactionType: { name: transactionType }
        },
        include: {
            journal: {
                include: {
                    entries: {
                        include: {
                            ledger: true,
                        },
                    },
                },
            },
        },
    });

    if (!budgetTransaction) {
        return;
    }

    const journal = await updateJournalAmountProcedure(client, {
        id: budgetTransaction.journalId,
        amount,
    });

    if (journal) {
        await client.budgetTransaction.update({
            data: {
                updatedAt: journal.updatedAt,
            },
            where: {
                id: budgetTransaction.id,
            },
        });

        await client.budget.update({
            data: {
                updatedAt: journal.updatedAt,
            },
            where: {
                id: budgetTransaction.budgetId,
            },
        });
    }

    if (journal) {
        return budgetTransaction;
    }
}

export async function changeBudgetTransactionDescriptionProcedure(
    client: PrismaClient,
    {
        id,
        description,
        transactionType,
    }: {
        id: number;
        description: string;
        transactionType?: string;
    }
) {
    const budgetTransaction = await client.budgetTransaction.update({
        data: {
            description,
        },
        where: {
            id,
            transactionType: { name: transactionType },
        },
        include: {
            budget: true,
        },
    });

    if (!budgetTransaction) {
        return;
    }

    const updatedJournal = await client.journal.update({
        data: {
            description: `${description} (${budgetTransaction.budget.name})`
        },
        where: {
            id: budgetTransaction.journalId,
        },
    });

    await client.budgetTransaction.update({
        data: {
            updatedAt: updatedJournal.updatedAt,
        },
        where: {
            id: budgetTransaction.id,
        },
    });

    await client.budget.update({
        data: {
            updatedAt: updatedJournal.updatedAt,
        },
        where: {
            id: budgetTransaction.budgetId,
        },
    });

    return budgetTransaction;
}

export async function deleteBudgetTransactionProcedure(
    client: PrismaClient,
    { 
        id, 
        transactionType,
        delegateBalancingLedgers = false,
        delegateUpdateBudgetDate = false,
    }: { 
        id: number, 
        transactionType?: string,
        delegateBalancingLedgers?: boolean,
        delegateUpdateBudgetDate?: boolean,
    }
): Promise<{ budgetTransaction: BudgetTransaction; ledgerIds?: number[] }> {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id,
            transactionType: { name: transactionType },
        },
    });

    if (!budgetTransaction) {
        return;
    }
    
    const deletedBudgetTransaction = await client.budgetTransaction.update({
        data: {
            deletedAt: new Date(),
        },
        where: {
            id: budgetTransaction.id,
        },
    });

    const { ledgerIds } = await deleteJournalProcedure(client, { 
        id: budgetTransaction.journalId, 
        delegateBalancingLedgers 
    });

    if (!delegateUpdateBudgetDate) {
        await client.budget.update({
            data: {
                updatedAt: deletedBudgetTransaction.updatedAt,
            },
            where: {
                id: deletedBudgetTransaction.budgetId,
            },
        });
    }

    return {
        budgetTransaction: deletedBudgetTransaction, 
        ledgerIds 
    };
}

export async function deleteBudgetTransactionManyProcedure(
    client: PrismaClient,
    { 
        transactions, 
        delegateBalancingLedgers = false,
    }: { 
        transactions: { id: number; transactionType?: string; }[], 
        delegateBalancingLedgers?: boolean,
    }
): Promise<{ budgetTransactions: BudgetTransaction[], ledgerIds: number[] }> {
    const deleteResults = await Promise.all(transactions.map(async ({ id, transactionType }) => {
        return await deleteBudgetTransactionProcedure(client, {
            id, 
            transactionType, 
            delegateBalancingLedgers: true, 
            delegateUpdateBudgetDate: true,
        });
    }));

    const ledgerIds = deleteResults.reduce((acc, deleteResult) => {
        return deleteResult.ledgerIds.reduce((acc, ledgerId) => {
            if (!acc.includes(ledgerId)) {
                acc.push(ledgerId);
            }

            return acc;
        }, acc);
    }, []);

    const budgetIds = deleteResults.reduce<number[]>((acc, deletedResult) => {
        if (acc.includes(deletedResult.budgetTransaction.budgetId)) {
            acc.push(deletedResult.budgetTransaction.budgetId);
        }

        return acc;
    }, []);
    
    await client.budget.updateMany({
        data: {
            updatedAt: new Date(),
        },
        where: {
            id: {
                in: budgetIds,
            },
        },
    });

    const budgetTransactions = deleteResults.map(
        ({ budgetTransaction }) => budgetTransaction
    );

    if (!delegateBalancingLedgers) {
        await Promise.all(ledgerIds.map(
            async (ledgerId) => await balancingLedgerProcedure(client, { id: ledgerId })
        ));   

        return { budgetTransactions, ledgerIds: [] };
    }

    return { budgetTransactions, ledgerIds };
}