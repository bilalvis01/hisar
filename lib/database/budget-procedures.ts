import { PrismaClient } from "@prisma/client";
import { 
    OWNER_CAPITAL_ACCOUNT_CODE, 
} from "./account-code";
import { 
    BUDGET_CASH_ACCOUNT,
    BUDGET_EXPENSE_ACCOUNT, 
} from "./budget-account-task";
import { 
    BUDGET_CASH_ACCOUNT_CODE, 
    BUDGET_EXPENSE_ACCOUNT_CODE,
} from "./account-code";
import { 
    ASSET, 
    EXPENSE,
} from "./account-type";
import { BUDGET_FUNDING } from "./budget-transaction-type";
import { createAccountProcedure } from "./account-procedures";
import { 
    createJournalProcedure,
    deleteJournalManyProcedure,
} from "./journal-procedures";
import { changeBudgetTransactionAmountProcedure } from "./budget-transaction-procedures";
import { 
    getBudgetCashAccount, 
    getBudgetExpenseAccount, 
} from "../utils/getBudgetAccount";

export async function createBudgetProcedure(
    client: PrismaClient,
    { name, amount }: { name: string; amount: bigint }
) {
    const budget = await client.budget.create({
        data: {
            name,
        },
    });

    const ownerCapitalAccountCode = await client.accountCode.findUnique({
        where: {
            code_virtualParentId: { code: OWNER_CAPITAL_ACCOUNT_CODE, virtualParentId: 0 },
        },
    }); 

    const ownerCapitalAccount = await client.account.findUnique({
        where: {
            accountCodeId: ownerCapitalAccountCode.id,
        }
    });

    const budgetCashAccount = await createAccountProcedure(client, {
        name: `${name} (cash)`,
        accountCode: { code: BUDGET_CASH_ACCOUNT_CODE, createChildIncrement: true },
        accountType: ASSET,
    });

    const budgetExpenseAccount = await createAccountProcedure(client, {
        name: `${name} (expense account)`,
        accountCode: { code: BUDGET_EXPENSE_ACCOUNT_CODE, createChildIncrement: true },
        accountType: EXPENSE,
    });

    await client.budgetAccountAssignment.create({
        data: {
            task: { connect: { name: BUDGET_CASH_ACCOUNT } },
            budget: { connect: { id: budget.id } },
            account: { connect: { id: budgetCashAccount.id } },
        },
    });

    await client.budgetAccountAssignment.create({
        data: {
            task: { connect: { name: BUDGET_EXPENSE_ACCOUNT } },
            budget: { connect: { id: budget.id } },
            account: { connect: { id: budgetExpenseAccount.id } },
        },
    });

    const journal = await createJournalProcedure(client, { 
        debitAccountId: budgetCashAccount.id, 
        creditAccountId: ownerCapitalAccount.id,
        amount, 
        description: `saldo awal (${name})`,
    });

    await client.budgetTransaction.create({
        data: {
            budget: { connect: { id: budget.id } },
            journal: { connect: { id: journal.id } },
            transactionType: { connect: { name: BUDGET_FUNDING } },
            description: "saldo awal",
        },
    });

    return budget;
}

export async function updateBudgetProcedure(
    client: PrismaClient, 
    {
        id, 
        name, 
        amount
    }: { 
        id: number; 
        name: string; 
        amount: bigint; 
    }
) {
    const budget = await client.budget.findUnique({
        where: {
            id,
        },
    });

    const budgetTransaction = await client.budgetTransaction.findFirst({
        where: {
            budget: { id, },
            transactionType: { name: BUDGET_FUNDING },
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
        },
    });

    const currentBudgetAmount = budgetTransaction.journal.entries[0].amount;

    if (budget.name !== name) {
        await changeBudgetNameProcedure(client, {
            id,
            name,
        });
    }

    if (currentBudgetAmount !== amount) {
        await changeBudgetAmountProcedure(client, { 
            idTransaction: budgetTransaction.id,
            amount,
        }); 
    }

    return await client.budget.findUnique({
        where: {
            id,
        },
    });
}

export async function deleteBudgetProcedure(client: PrismaClient, { id }: { id: number }) {
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

    const budgetCashAccount = getBudgetCashAccount(budget);
    const budgetExpenseAccount = getBudgetExpenseAccount(budget);

    await client.budget.update({
        where: {
            id
        },
        data: {
            active: false,
        },
    });

    await client.account.update({
        where: {
            id: budgetCashAccount.id,
        },
        data: {
            active: false,
        },
    });

    await client.account.update({
        where: {
            id: budgetExpenseAccount.id,
        },
        data: {
            active: false,
        },
    });

    const transactions = await client.budgetTransaction.findMany({
        where: {
            budget: { id: budget.id },
        },
    });

    const journalIds = transactions.map(
        (transaction) => transaction.journalId
    );

    await deleteJournalManyProcedure(client, { ids: journalIds });

    return budget;
}

export async function changeBudgetAmountProcedure(
    client: PrismaClient,
    {
        idTransaction,
        amount,
    }: {
        idTransaction: number;
        amount: bigint;
    }
) {
    await changeBudgetTransactionAmountProcedure(client, {
        id: idTransaction,
        amount,
    });
}

export async function changeBudgetNameProcedure(
    client: PrismaClient,
    {
        id,
        name,
    }: {
        id: number,
        name: string,
    }
) {
    await client.budget.update({
        data: {
            name,
        },
        where: {
            id,
        },
    });

    const budgetTransactions = await client.budgetTransaction.findMany({
        select: {
            id: true,
            description: true,
            journalId: true,
        },
        where: {
            budget: { id },
        },
    });

    await Promise.all(budgetTransactions.map(async (budgetTransaction) => {
        await client.journal.update({
            data: {
                description: `${budgetTransaction.description} (${name})`,
            },
            where: {
                id: budgetTransaction.journalId,
            },
        });
    }));
}