import { PrismaClient } from "@prisma/client";
import { 
    BUDGET_CASH_ACCOUNT,
    BUDGET_EXPENSE_ACCOUNT,
} from "./budget-account-task";
import { 
    createJournalProcedure,
    deleteJournalProcedure,
} from "./journal-procedures";
import { balanceLedgerProcedure } from "./common-procedures";

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
            (entry) => entry.ledger.open && !entry.ledger.softDeleted
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
    { id }: { id: string }
) {
    const budgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id: parseInt(id),
        },
    }); 

    await deleteJournalProcedure(client, { id: budgetTransaction.journalId });

    return await client.budgetTransaction.update({
        data: {
            softDeleted: true,
        },
        where: {
            id: budgetTransaction.id,
        },
    });
}