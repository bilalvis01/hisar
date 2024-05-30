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
import { createJournalProcedure } from "./journal-procedures";
import { 
    changeBudgetTransactionAmountProcedure, 
    deleteBudgetTransactionManyProcedure,
} from "./budget-transaction-procedures";
import { balancingLedgerProcedure } from "./common-procedures";

export async function createBudgetProcedure(
    client: PrismaClient,
    { name, amount }: { name: string; amount: bigint }
) {
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
        name: `${name} (expense)`,
        accountCode: { code: BUDGET_EXPENSE_ACCOUNT_CODE, createChildIncrement: true },
        accountType: EXPENSE,
    });

    const budget = await client.budget.create({
        data: {
            code: budgetCashAccount.code,
            name,
        },
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

export async function deleteBudgetProcedure(
    client: PrismaClient, 
    { id, delegateBalancingLedgers = false }: { id: number, delegateBalancingLedgers?: boolean }
) {
    const budget = await client.budget.findUnique({
        where: {
            id,
        },
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
    });

    const budgetCashAccount = budget.accountAssignments.filter(
        (budgetAccount) => budgetAccount.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];

    const budgetExpenseAccount = budget.accountAssignments.filter(
        (budgetAccount) => budgetAccount.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0]["account"];

    const budgetCashAccountLedger = budgetCashAccount.ledgers[0];

    const budgetExpenseAccountLedger = budgetExpenseAccount.ledgers[0];

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

    if (budgetCashAccountLedger) {
        await client.ledger.update({
            data: {
                deletedAt: new Date(),
            },
            where: {
                id: budgetCashAccountLedger.id,
            },
        }); 
    }

    if (budgetExpenseAccountLedger) {
        await client.ledger.update({
            data: {
                deletedAt: new Date(),
            },
            where: {
                id: budgetExpenseAccountLedger.id,
            },
        }); 
    }

    const transactions = await client.budgetTransaction.findMany({
        where: {
            budget: { id: budget.id },
        },
    });

    const transactionIds = transactions.map((transaction) => transaction.id);

    const { ledgerIds }  = await deleteBudgetTransactionManyProcedure(client, { 
        ids: transactionIds, 
        delegateBalancingLedgers,
    });

    return { budget, ledgerIds };
} 

export async function deleteBudgetManyProcedure(
    client: PrismaClient,
    { ids }: { ids: number[] }
) {
    const deleteResults = await Promise.all(ids.map(
        async (id) => await deleteBudgetProcedure(client, { 
            id, delegateBalancingLedgers: true
        })
    ));

    const ledgerIds = deleteResults.reduce<number[]>((acc, deleteResult) => {
        return deleteResult.ledgerIds.reduce((acc, ledgerId) => {
            if (!acc.includes(ledgerId)) {
                acc.push(ledgerId);
            }

            return acc;
        }, acc);
    }, []);

    await Promise.all(ledgerIds.map(
        async (ledgerId) => await balancingLedgerProcedure(client, { id: ledgerId })
    ));   
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
    const budget = await client.budget.update({
        data: {
            name,
        },
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

    await Promise.all(budget.accountAssignments.map(async (accountAssignment) => {
        let newName;

        if (accountAssignment.task.name === BUDGET_CASH_ACCOUNT) {
            newName = `${name} (cash)`;
        }

        if (accountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT) {
            newName = `${name} (expense)`;
        }

        await client.account.update({
            data: {
                name: newName,
            },
            where: {
                id: accountAssignment.account.id,
            },
        });
    }));

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