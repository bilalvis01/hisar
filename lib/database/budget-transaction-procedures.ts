import { 
    PrismaClient,
    BudgetTransaction, 
} from "@prisma/client";
import { 
    BUDGET_CASH_ACCOUNT,
    BUDGET_EXPENSE_ACCOUNT,
} from "./budget-account-task";
import { 
    createJournalProcedure,
    deleteJournalProcedure,
} from "./journal-procedures";
import { balanceLedgerProcedure } from "./common-procedures";
import * as accountCode from "../utils/accountCode";

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

    return await client.budgetTransaction.create({
        data: {
            budget: { connect: { id: budget.id } },
            journal: { connect: { id: journal.id } },
            transactionType: { connect: { name: transactionType } },
            description,
        },
    });
}

export async function changeBudgetTransactionHostProcedure(
    client: PrismaClient,
    {
        idTransaction,
        budgetCode: rawBudgetCode,
    }: {
        idTransaction: number;
        budgetCode: string;
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

export async function changeBudgetTransactionAmountProcedure(
    client: PrismaClient,
    {
        id,
        amount,
    }: {
        id: number;
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
                        include: {
                            ledger: true,
                        },
                    },
                },
            },
        },
    });

    if (
        budgetTransaction.journal.entries.every(
            (entry) => entry.ledger.open && !entry.ledger.deletedAt
        )
    ) {
        await Promise.all(budgetTransaction.journal.entries.map(async (entry) => {
            await client.entry.update({
                data: {
                    amount,
                },
                where: {
                    id: entry.id,
                },
            });

            await balanceLedgerProcedure(client, { id: entry.ledger.id });
        }));
    }
}

export async function changeBudgetTransactionDescriptionProcedure(
    client: PrismaClient,
    {
        id,
        description,
    }: {
        id: number,
        description: string,
    }
) {
    const budgetTransaction = await client.budgetTransaction.update({
        data: {
            description,
        },
        where: {
            id,
        },
        include: {
            journal: true,
            budget: true,
        },
    })

    await client.journal.update({
        data: {
            description: `${description} (${budgetTransaction.budget.name})`
        },
        where: {
            id: budgetTransaction.journal.id,
        },
    })

    return budgetTransaction;
}

export async function deleteBudgetTransactionProcedure(
    client: PrismaClient,
    { id, delegateBalancingLedgers = false }: { id: number, delegateBalancingLedgers?: boolean }
): Promise<{ budgetTransaction: BudgetTransaction; ledgerIds: number[] }> {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id,
        },
    });
    
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

    if (!delegateBalancingLedgers) {
        return { budgetTransaction: deletedBudgetTransaction, ledgerIds: [] };
    }

    return { 
        budgetTransaction: deletedBudgetTransaction, 
        ledgerIds 
    };
}

export async function deleteBudgetTransactionManyProcedure(
    client: PrismaClient,
    { ids, delegateBalancingLedgers = false }: { ids: number[], delegateBalancingLedgers?: boolean }
): Promise<{ budgetTransactions: BudgetTransaction[], ledgerIds: number[] }> {
    const deleteResults = await Promise.all(ids.map(async (id) => {
        return await deleteBudgetTransactionProcedure(client, {
            id, delegateBalancingLedgers: true,
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

    const budgetTransactions = deleteResults.map(
        ({ budgetTransaction }) => budgetTransaction
    );

    if (!delegateBalancingLedgers) {
        await Promise.all(ledgerIds.map(
            async (ledgerId) => await balanceLedgerProcedure(client, { id: ledgerId })
        ));   

        return { budgetTransactions, ledgerIds: [] };
    }

    return { budgetTransactions, ledgerIds };
}