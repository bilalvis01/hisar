import { 
    PrismaClient, 
    Budget, 
} from "@prisma/client";
import expenseID from "../utils/expenseID";
import * as accountCode from "../utils/accountCode";
import { BUDGET_EXPENSE_ACCOUNT_CODE } from "../database/account-code";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT,
} from "../database/budget-account-task";
import { 
    BUDGET_FUNDING,
    BUDGET_EXPENSE,
} from "../database/budget-transaction-type"
import { GetBudgetInput, BudgetTransactionType } from "../graphql/resolvers-types";

export async function fetchBudgets(dataSources: PrismaClient, input?: GetBudgetInput ) {    
    const budgets = await dataSources.budget.findMany({ 
        where: {
            active: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return await Promise.all(budgets.map(async (budget) => await getBudgetDetail(dataSources, budget)));
};

export async function fetchBudgetByCode(dataSources: PrismaClient, code: string) {
    const budgetCode = accountCode.split(code);
    return await dataSources.budget.findFirst({
        where: {
            code,
            active: true,
        },
    });
} 

export async function fetchBudgetsByCodes(dataSources: PrismaClient, codes: string[]) {
    return await Promise.all(codes.map(
        async (code) => await fetchBudgetByCode(dataSources, code)
    ));
}

export async function getBudgetDetail(
    dataSources: PrismaClient, 
    budget: Budget,
) {
    const rawBudgetTransactions = (await dataSources.budgetTransaction.findMany({
        where: {
            budget: { id: budget.id },
            softDeleted: false,
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
                                        }
                                    },
                                },
                            },
                        },
                    },
                },
            },
            transactionType: true,
        },
    }));

    const budgetTransactions = rawBudgetTransactions.map((budgetTransaction) => ({
        id: expenseID.format(budgetTransaction.id),
        description: budgetTransaction.description,
        expense: budgetTransaction.transactionType.name === BUDGET_EXPENSE
            ? budgetTransaction.journal.entries[0].amount
            : null,
        balance: budgetTransaction.journal.entries[0].balance,
        transactionType: budgetTransaction.transactionType.name === BUDGET_FUNDING
            ? BudgetTransactionType.Funding
            : BudgetTransactionType.Expense,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
    }));

    const accountAssignments = await dataSources.budgetAccountAssignment.findMany({
        where: {
            budget: { id: budget.id }
        },
        include: {
            account: {
                include: {
                    ledgers: {
                        where: {
                            open: true,
                            softDeleted: false,
                        },
                    },
                    accountCode: {
                        include: {
                            parent: true,
                        },
                    },
                },
            },
            task: true
        },
    });

    const budgetAmount = rawBudgetTransactions.filter(
        (rawBudgetTransaction) => rawBudgetTransaction.transactionType.name === BUDGET_FUNDING
    )[0]["journal"]["entries"][0]["amount"];

    const budgetCashAccount = accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];

    const budgetExpenseAccount = accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0]["account"];

    return {
        code: budget.code,
        name: budget.name,
        amount: budgetAmount,
        expense: budgetExpenseAccount.ledgers[0].balance,
        balance: budgetCashAccount.ledgers[0].balance,
        transactions: budgetTransactions,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
    }
}