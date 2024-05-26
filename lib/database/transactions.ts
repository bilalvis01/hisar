import { 
    PrismaClient,
} from "@prisma/client";
import { 
    CASH_ACCOUNT_CODE,
} from "./account-code";
import { 
    journalizeProcedure,
    createBudgetProcedure,
    deleteBudgetProcedure,
    createExpenseProcedure,
    balanceLedgerProcedure,
} from "./procedures";
import { 
    getBudgetCashAccount, 
    getBudgetExpenseAccount, 
} from "../utils/getBudgetAccount";

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
        return await journalizeProcedure(tx, { 
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

export async function updateBudget(client: PrismaClient, {
    id, name, amount
}: { id: number; name: string; amount: bigint; }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        const cashAccount = await tx.account.findFirst({
            where: {
                accountCode: {
                    code: CASH_ACCOUNT_CODE,
                },
            },
        });
        
        const budget = await tx.budget.findUnique({
            where: {
                id,
            },
            include: {
                accountAssignments: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        const budgetCashAccount = getBudgetCashAccount(budget);

        const openCashLedger = await tx.ledger.findFirst({
            where: {
                account: { id: cashAccount.id },
                open: true,
            },
            include: {
                entries:  {
                    where: {
                        direction: DEBIT,
                    },
                    orderBy: {
                        id: "asc",
                    },
                },
            },
        });

        const openBudgetCashLedger = await tx.ledger.findFirst({
            where: {
                account: { id: budgetCashAccount.id },
                open: true,
            },
            include: {
                entries: {
                    where: {
                        direction: CREDIT,
                    },
                    orderBy: {
                        id: "asc",
                    },
                },
            },
        });

        const cashEntry = openCashLedger.entries[0];
        const budgetCashEntry = openBudgetCashLedger.entries[0];

        const currentBudgetFund = openBudgetCashLedger.entries[0].amount;

        if (budget.name !== name) {
            await tx.budget.update({
                where: {
                    id,
                },
                data: {
                    name,
                }
            });
        }

        if (currentBudgetFund !== amount) {
            await tx.entry.update({
                where: {
                    id: cashEntry.id,
                },
                data: {
                    amount: amount,
                },
            });

            await tx.entry.update({
                where: {
                    id: budgetCashEntry.id,
                },
                data: {
                    amount: amount,
                },
            });

            await balanceLedgerProcedure(tx, { id: openBudgetCashLedger.id });
            await balanceLedgerProcedure(tx, { id: openCashLedger.id });

            await tx.budget.update({
                where: {
                    id: budget.id,
                },
                data: {
                    updatedAt: new Date(),
                },
            });
        }

        return budget;
    });
}

export async function deleteBudget(client: PrismaClient, { id }: { id: number }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await deleteBudgetProcedure(tx, { id });
    });
} 

export async function deleteBudgetMany(client: PrismaClient, { ids }: { ids: number[] }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await Promise.all(ids.map(id => deleteBudgetProcedure(tx, { id })));
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
    { 
        id,
        description, 
        amount 
    }: { 
        id: string; 
        description: string; 
        amount: bigint; 
    }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        const journalId = parseInt(id);

        const journal = await tx.journal.findUnique({
            where: {
                id: journalId,
            },
            include: {
                entries: {
                    include: {
                        ledger: true,
                    },
                },
            },
        });

        const debitJournalEntry = journal.entries.filter((entry) => entry.direction === DEBIT)[0];
        const creditJournalEntry = journal.entries.filter((entry) => entry.direction === CREDIT)[0];

        const openDebitLedger = await tx.ledger.findUnique({
            where: {
                id: debitJournalEntry.ledger.id,
                open: true,
            },
        });

        const openCreditLedger = await tx.ledger.findUnique({
            where: {
                id: creditJournalEntry.ledger.id,
                open: true,
            },
        });

        const currentExpenseAmount = debitJournalEntry.amount;

        if (currentExpenseAmount !== amount) {
            await tx.entry.update({
                where: {
                    id: debitJournalEntry.id,
                },
                data: {
                    amount,
                },
            });

            await tx.entry.update({
                where: {
                    id: creditJournalEntry.id,
                },
                data: {
                    amount,
                },
            });

            await balanceLedgerProcedure(tx, { id: openDebitLedger.id });
            await balanceLedgerProcedure(tx, { id: openCreditLedger.id });
        }

        if (journal.description != description) {
            await tx.journal.update({
                where: {
                    id: journal.id,
                },
                data: {
                    description,
                },
            });
        }

        return journal;
    });
}