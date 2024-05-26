import { 
    PrismaClient,
    Budget,
    BudgetAccountAssignment,
    Account,
    Entry,
} from "@prisma/client";
import { 
    OWNER_CAPITAL_ACCOUNT_CODE, 
    BUDGET_EXPENSE_ACCOUNT_CODE, 
    BUDGET_CASH_ACCOUNT_CODE,
} from "./account-code";
import { 
    ASSET, 
    EXPENSE,
} from "./account-type";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT,
} from "./budget-account-task";
import { 
    BUDGET_FUNDING, 
    BUDGET_EXPENSE,
} from "./budget-transaction-type";
import { 
    getBudgetCashAccount, 
    getBudgetExpenseAccount, 
} from "../utils/getBudgetAccount";
import * as accountCode from "../utils/accountCode";

const DEBIT = 1;
const CREDIT = -1;

function countBalance({ 
    ledgerDirection,
    entries,
    entryIndex,
}: {
    ledgerDirection: number;
    entries: Entry[],
    entryIndex: number,
}) {
    return entries.reduce((acc, entry, countingBalanceIndex) => {
        if (countingBalanceIndex > entryIndex) {
            return acc;
        }

        return acc + entry.amount * BigInt(entry.direction) * BigInt(ledgerDirection);
    }, BigInt(0));
}

export async function createAccountCodeProcedure(
    client: PrismaClient, 
    { code, createChildIncrement = false }: { code: number, createChildIncrement?: boolean }
) {
    if (createChildIncrement) {
        let rootAccountCode = await client.accountCode.findUnique({
            where: {
                code_virtualParentId: { code, virtualParentId: 0 },
            }
        });
    
        if (!rootAccountCode) {
            rootAccountCode = await client.accountCode.create({
                data: {
                    code,
                }
            });
        }

        const lastChildAccountCode = await client.accountCode.findFirst({
            where: { parent: { id: rootAccountCode.id } },
            orderBy: {
                code: "desc",
            },
        });

        return await client.accountCode.create({
            data: {
                parent: { connect: { id: rootAccountCode.id } },
                virtualParentId: rootAccountCode.id,
                code: lastChildAccountCode ? lastChildAccountCode.code + 1 : 1,
            },
        });
    }

    return await client.accountCode.create({
        data: {
            code,
        },
    });
}

export async function createAccountProcedure(
    client: PrismaClient, 
    {
        name,
        accountCode: accountCode_,
        accountType,
    }: {
        name: string,
        accountCode: { code: number, createChildIncrement?: boolean },
        accountType: string,
    }
) {
    const accountCode = await createAccountCodeProcedure(client, accountCode_);

    const account = await client.account.create({
        data: {
            name,
            accountCode: { connect: { id: accountCode.id } },
            accountType: { connect: { name: accountType } },
        },
    });

    await client.ledger.create({
        data: {
            balance: BigInt(0),
            account: { connect: { id: account.id, } },
        },
    });

    return account;
}

export async function balanceLedgerProcedure(client: PrismaClient, { id }: { id: number }) {
    const ledger = await client.ledger.findUnique({
        where: {
            id,
            open: true,
            softDeleted: false,
        },
        include: {
            entries: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            account: {
                include: {
                    accountType: true,
                },
            },
        },
    });

    if (!ledger) {
        return;
    };

    const ledgerDirection = ledger.account.accountType.ledgerDirection;

    await Promise.all(ledger.entries.map(async (entry, entryIndex, entries) => {
        const balance = countBalance({ ledgerDirection, entries, entryIndex });

        await client.entry.update({
            where: {
                id: entry.id,
            },
            data: {
                balance,
            },
        });
    }));

    const ledgerBalance = countBalance({ 
        ledgerDirection, 
        entries: ledger.entries,
        entryIndex: ledger.entries.length - 1,
    });

    await client.ledger.update({
        where: {
            id: ledger.id,
        },
        data: {
            balance: ledgerBalance,
        },
    });
};

export async function journalizeProcedure(
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
        description: string,
    }
) {
    const journal = await client.journal.create({
        data: {
            description,
        },
    });

    const debitAccount = await client.account.findUnique({
        where: {
            id: debitAccountId,
        },
        include: {
            accountType: true,
        },
    });

    const creditAccount = await client.account.findUnique({
        where: {
            id: creditAccountId,
        },
        include: {
            accountType: true,
        },
    });

    const openDebitLedger = await client.ledger.findFirst({
        where: {
            account: { id: debitAccountId, },
            open: true,
        },
        orderBy: {
            id: "desc",
        },
    });

    const openCreditLedger = await client.ledger.findFirst({
        where: {
            account: { id: creditAccountId, },
            open: true,
        },
        orderBy: {
            id: "desc",
        },
    });

    const debitBalance = openDebitLedger.balance 
        + amount * BigInt(DEBIT) * BigInt(debitAccount.accountType.ledgerDirection);
    const creditBalance = openCreditLedger.balance
        + amount * BigInt(CREDIT) * BigInt(creditAccount.accountType.ledgerDirection);

    const debitEntry = await client.entry.create({
        data: {
            journal: { connect: { id: journal.id } },
            ledger: { connect: { id: openDebitLedger.id } },
            direction: DEBIT,
            amount,
            balance: debitBalance,
        },
    });

    const creditEntry = await client.entry.create({
        data: {
            journal: { connect: { id: journal.id } },
            ledger: { connect: { id: openCreditLedger.id } },
            direction: CREDIT,
            amount,
            balance: creditBalance,
        },
    });

    await client.ledger.update({
        where: {
            id: openDebitLedger.id,
        },
        data: {
            balance: debitBalance,
        },
    });

    await client.ledger.update({
        where: {
            id: openCreditLedger.id,
        },
        data: {
            balance: creditBalance,
        },
    });

    return journal;
}

export async function deleteJournalProcedure(
    client: PrismaClient,
    { id, skipUpdateLedgerBalance = false }: { id: number, skipUpdateLedgerBalance?: boolean }
) {
    const journal = await client.journal.update({
        data: {
            softDeleted: true,
        },
        where: {
            id,
        },
        include: {
            entries: {
                include: {
                    ledger: true,
                },
            },
        },
    });

    await client.entry.updateMany({
        data: {
            softDeleted: true,
        },
        where: {
            id: journal.id,
        },
    });

    if (!skipUpdateLedgerBalance) {
        await Promise.all(journal.entries.map(async (entry) => {
            if (entry.ledger.open && !entry.ledger.softDeleted) {
                await balanceLedgerProcedure(client, { id: entry.ledger.id });
            }
        }));
    }

    return journal;
}

export async function deleteJournalManyProcedure(
    client: PrismaClient,
    { ids }: { ids: number[] }
) {
    const journals = await Promise.all(ids.map(async (id) => {
        return await deleteJournalProcedure(client, { 
            id, skipUpdateLedgerBalance: true 
        });
    }));

    const ledgerIds = journals.reduce<number[]>((acc, journal) => {
        return journal.entries.reduce((acc, entry) => {
            if (!acc.includes(entry.ledger.id) && entry.ledger.open && !entry.ledger.softDeleted) {
                acc.push(entry.ledger.id);
            }

            return acc
        }, acc);
    }, []);

    await Promise.all(ledgerIds.map(
        async (ledgerId) => await balanceLedgerProcedure(client, { id: ledgerId })
    ));
}

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

    const journal = await journalizeProcedure(client, { 
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

    const journal = await journalizeProcedure(client, {
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
        await changeBudgetName(client, {
            id,
            name,
        });
    }

    if (currentBudgetAmount !== amount) {
        await changeBudgetAmount(client, { 
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

export async function changeBudgetAmount(
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

export async function changeBudgetName(
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

export async function createExpenseProcedure(
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
    return await createBudgetTransactionProcedure(client, {
        id: budgetId,
        description,
        amount,
        transactionType: BUDGET_EXPENSE,
    });
}

export async function changeExpenseAmountProcedure(
    client: PrismaClient,
    {
        id,
        amount,
    }: {
        id: number;
        amount: bigint;
    }
) {
    return await changeBudgetTransactionAmountProcedure(client, {
        id,
        amount,
    });
}

export async function changeExpenseDescriptionProcedure(
    client: PrismaClient,
    {
        id,
        description,
    }: {
        id: number,
        description: string,
    }
) {
    await changeBudgetTransactionDescriptionProcedure(client, {
        id,
        description,
    });
}

export async function changeExpenseBudgetHostProcedure(
    client: PrismaClient,
    {
        idTransaction,
        budgetCode: rawBudgetCode,
    }: {
        idTransaction: number,
        budgetCode: string,
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
                                    softDeleted: false,
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

export async function updateExpenseProcedure(
    client: PrismaClient, 
    { 
        id,
        budgetCode,
        description, 
        amount 
    }: { 
        id: string; 
        budgetCode: string;
        description: string; 
        amount: bigint; 
    }
) {
    const transactionId = parseInt(id);

    const budgetTransaction = await client.budgetTransaction.findUnique({
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
            budget: {
                include: {
                    accountAssignments: {
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
                            task: true,
                        },
                    },
                },
            },
        },
    });

    const budgetCashAccount = budgetTransaction.budget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];

    const currentBudgetCode = 
        `${budgetCashAccount.accountCode.parent.code}-${accountCode.format(budgetCashAccount.accountCode.code)}`;

    const currentExpenseAmount = budgetTransaction.journal.entries[0].amount;

    if (currentBudgetCode !== budgetCode) {
        await changeExpenseBudgetHostProcedure(client, {
            idTransaction: budgetTransaction.id,
            budgetCode,
        });
    }

    if (currentExpenseAmount !== amount) {
        await changeExpenseAmountProcedure(client, { id: transactionId, amount });
    }

    if (budgetTransaction.description != description) { 
        await changeExpenseDescriptionProcedure(client, { id: transactionId, description });
    }

    return await client.budgetTransaction.findUnique({
        where: {
            id: transactionId,
        },
    });
}