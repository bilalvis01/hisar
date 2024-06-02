import { 
    PrismaClient, 
    Account,
    Budget, 
    BudgetAccountAssignment,
    BudgetAccountTask,
    BudgetTransaction,
    BudgetTransactionType,
    Journal,
    Entry,
    Ledger,
} from "@prisma/client";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT,
} from "../database/budget-account-task";
import { 
    BUDGET_FUNDING,
} from "../database/budget-transaction-type";
import { Budget as ResolverBudget } from "../graphql/resolvers-types";
import { RecordNotFoundError } from "../graphql/error";

export async function fetchBudgets(dataSources: PrismaClient) {    
    const rawBudgets = await dataSources.budget.findMany({ 
        where: {
            active: true,
        },
        orderBy: {
            id: "desc",
        },
        include: {
            accountAssignments: {
                include: {
                    task: true,
                    account: {
                        include: {
                            ledgers: true,
                        },
                    },
                },
            },
            budgetTransactions: {
                include: {
                    transactionType: true,
                    journal: {
                        include: {
                            entries: true,
                        },
                    },
                },
            },
        },
    });

    return rawBudgets.map(
        (rawBudget) => mapRawBudgetData(rawBudget)
    );
};

export async function fetchBudgetByCode(
    dataSources: PrismaClient, 
    code: string
): Promise<ResolverBudget> {
    const rawBudget = await dataSources.budget.findFirst({
        where: {
            code,
            active: true,
        },
        include: {
            accountAssignments: {
                include: {
                    task: true,
                    account: {
                        include: {
                            ledgers: true,
                        },
                    },
                },
            },
            budgetTransactions: {
                include: {
                    transactionType: true,
                    journal: {
                        include: {
                            entries: true,
                        },
                    },
                },
            },
        },
    });

    if (!rawBudget) {
        throw new RecordNotFoundError(`Budget dengan kode ${code} tidak ditemukan`);
    }

    return mapRawBudgetData(rawBudget);
} 

export async function fetchBudgetsByCodes(dataSources: PrismaClient, codes: string[]) {
    return await Promise.all(codes.map(
        async (code) => await fetchBudgetByCode(dataSources, code)
    ));
}

export function mapRawBudgetData(
    rawBudget: Budget & { 
        accountAssignments: (BudgetAccountAssignment & { 
            account: Account & { ledgers: Ledger[] };
            task: BudgetAccountTask;
        })[];
        budgetTransactions: (BudgetTransaction & { 
            transactionType: BudgetTransactionType;
            journal: Journal & { entries: Entry[] };
        })[];
    }
): ResolverBudget {
    const amount = rawBudget.budgetTransactions.filter(
        (rawBudgetTransaction) => rawBudgetTransaction.transactionType.name === BUDGET_FUNDING
    )[0].journal.entries[0].amount;

    const balance = rawBudget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT
    )[0].account.ledgers[0].balance;

    const expense = rawBudget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0].account.ledgers[0].balance;

    return {
        code: rawBudget.code,
        name: rawBudget.name,
        description: rawBudget.description,
        amount,
        expense,
        balance,
        createdAt: rawBudget.createdAt,
        updatedAt: rawBudget.updatedAt,
    };
}