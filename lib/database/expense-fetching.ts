import { PrismaClient } from "@prisma/client";
import expenseID from "../utils/expenseID";
import { BUDGET_EXPENSE_ACCOUNT_CODE } from "../database/account-code";
import { BUDGET_EXPENSE } from "../database/budget-transaction-type";

export async function fetchExpenses(dataSources: PrismaClient) {
    const budgetTransactions = await dataSources.budgetTransaction.findMany({
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
        where: {
            transactionType: {
                name: BUDGET_EXPENSE,
            },
            softDeleted: false,
        },
        orderBy: {
            id: "desc",
        },
    });

    return budgetTransactions.map(
        (budgetTransaction) => ({ 
            id: expenseID.format(budgetTransaction.id),
            description: budgetTransaction.description,
            budgetCode: budgetTransaction.budget.code,
            budgetName: budgetTransaction.budget.name,
            amount: budgetTransaction.journal.entries[0].amount,
            createdAt: budgetTransaction.createdAt,
            updatedAt: budgetTransaction.updatedAt
        })
    )
}

export async function fetchExpenseById(dataSources: PrismaClient, id: string) {
    const budgetTransaction = await dataSources.budgetTransaction.findUnique({
        where: {
            id: parseInt(id),
            softDeleted: false,
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
                                            accountCode: {
                                                include: {
                                                    parent: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
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

    return {
        id: expenseID.format(budgetTransaction.id),
        description: budgetTransaction.description,
        budgetCode: budgetTransaction.budget.code,
        budgetName: budgetTransaction.budget.name,
        amount: budgetTransaction.journal.entries[0].amount,
        createdAt: budgetTransaction.createdAt,
        updatedAt: budgetTransaction.updatedAt,
    };
}

export async function fetchExpensesByIds(dataSources: PrismaClient, { ids }: { ids: string[]; }) {
    return await Promise.all(ids.map(
        async (id) => await fetchExpenseById(dataSources, id)
    ));
};