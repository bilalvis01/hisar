import { 
    PrismaClient, 
    Budget,
    BudgetTransaction,
    BudgetTransactionType,
    Journal,
    Entry,
} from "@prisma/client";
import expenseID from "../utils/expenseID";
import { BUDGET_CASH_ACCOUNT_CODE } from "../database/account-code";

export async function fetchBudgetTransactionById(
    client: PrismaClient, 
    { id, transactionType }: { id: number, transactionType?: string }
) {
    const rawBudgetTransaction = await client.budgetTransaction.findUnique({
        where: {
            id,
            transactionType: {
                name: transactionType,
            },
            deletedAt: null,
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
                                            code: BUDGET_CASH_ACCOUNT_CODE,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            budget: true,
            transactionType: true,
        },
    });

    if (!rawBudgetTransaction) {
        return;
    }

    return mapRawBudgetTransaction(rawBudgetTransaction);
}

export async function fetchBudgetTransactions(
    client: PrismaClient,
    {
        budgetCode,
        transactionType,
        sortOrder = "desc",
    }: {
        budgetCode?: string;
        transactionType?: string;
        sortOrder?: "asc" | "desc";
    }
) {
    const rawBudgetTransactions = await client.budgetTransaction.findMany({
        include: {
            journal: {
                include: {
                    entries: {
                        where: {
                            ledger: {
                                account: {
                                    accountCode: {
                                        parent: {
                                            code: BUDGET_CASH_ACCOUNT_CODE,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            budget: true,
            transactionType: true,
        },
        where: {
            budget: {
                code: budgetCode,
            },
            transactionType: {
                name: transactionType,
            },
            deletedAt: null,
        },
        orderBy: {
            createdAt: sortOrder,
        },
    });

    return rawBudgetTransactions.map(
        (rawBudgetTransaction) => mapRawBudgetTransaction(rawBudgetTransaction)
    );
}

export function mapRawBudgetTransaction(
    data: BudgetTransaction & { 
        budget: Budget, 
        transactionType: BudgetTransactionType, 
        journal: Journal & { entries: Entry[] } 
    }
) {
    return {
        id: expenseID.format(data.id),
        budgetCode: data.budget.code,
        budgetName: data.budget.name,
        description: data.description,
        amount: data.journal.entries[0].amount,
        balance: data.journal.entries[0].balance,
        transactionType: data.transactionType.name,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    }
}