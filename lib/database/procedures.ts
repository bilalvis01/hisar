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
} from "./budget-account-assignment";
import { 
    BUDGET_FUNDING, 
    BUDGET_EXPENSE,
} from "./budget-transacton-type";
import { 
    getBudgetCashAccount, 
    getBudgetExpenseAccount, 
} from "../utils/getBudgetAccount";
import exp from "constants";

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
        },
        include: {
            entries: true,
            account: {
                include: {
                    accountType: true,
                },
            },
        },
    });

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

    await client.ledger.update({
        where: {
            id: ledger.id,
        },
        data: {
            updatedAt: new Date(),
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

export async function softDeleteJournalProcedure(
    client: PrismaClient,
    { id }: { id: number }
) {
    const journal = await client.journal.update({
        data: {
            softDeleted: true,
        },
        where: {
            id,
        },
        include: {
            entries: true,
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

    await Promise.all(journal.entries.map(async (entry) => {
        await balanceLedgerProcedure(client, { id: entry.ledgerId });
    }));

    return journal;
}

export async function hardDeleteJournalProcedure(
    client: PrismaClient,
    { id }: { id: number }
) {
    await client.entry.deleteMany({
        where: {
            journal: { id },
        },
    });

    const journal = await client.journal.delete({
        where: { id },
        include: {
            entries: true,
        },
    });

    await Promise.all(journal.entries.map(async (entry) => {
        await balanceLedgerProcedure(client, { id: entry.ledgerId });
    }));

    return journal;
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
            task: BUDGET_CASH_ACCOUNT,
            budget: { connect: { id: budget.id } },
            account: { connect: { id: budgetCashAccount.id } },
        },
    });

    await client.budgetAccountAssignment.create({
        data: {
            task: BUDGET_EXPENSE_ACCOUNT,
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

    await Promise.all(transactions.map(async (transaction) => {
        return await softDeleteJournalProcedure(client, { id: transaction.journalId });
    }));

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
                },
            },
        },
    });

    const budgetCashAccount = budget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task === BUDGET_CASH_ACCOUNT 
    )[0].account;

    const budgetExpenseAccount = budget.accountAssignments.filter(
        (accountAssignment) => accountAssignment.task === BUDGET_EXPENSE_ACCOUNT
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
    await createBudgetTransactionProcedure(client, {
        id: budgetId,
        description,
        amount,
        transactionType: BUDGET_EXPENSE,
    });
};