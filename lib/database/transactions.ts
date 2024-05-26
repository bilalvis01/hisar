import { 
    PrismaClient,
} from "@prisma/client";
import { 
    BUDGET_EXPENSE_ACCOUNT_CODE,
    CASH_ACCOUNT_CODE,
} from "./account-code";
import { 
    journalizeProcedure,
    createBudgetProcedure,
    deleteBudgetProcedure,
    createExpenseProcedure,
    balanceLedgerProcedure,
    changeExpenseAmountProcedure,
    changeExpenseDescriptionProcedure,
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
                        task: true,
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
        const transactionId = parseInt(id);

        const budgetTransaction = await tx.budgetTransaction.findUnique({
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
            },
        });

        const currentExpenseAmount = budgetTransaction.journal.entries[0].amount;

        if (currentExpenseAmount !== amount) {
            await changeExpenseAmountProcedure(tx, { id: transactionId, amount });
        }

        if (budgetTransaction.description != description) {
            await changeExpenseDescriptionProcedure(tx, { id: transactionId, description });
        }

        return await tx.budgetTransaction.findUnique({
            where: {
                id: transactionId,
            },
        });
    });
}