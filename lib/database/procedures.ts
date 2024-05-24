import { 
    PrismaClient,
    LedgerEntry,
    Entry,
} from "@prisma/client";
import { 
    CASH_ACCOUNT_CODE, 
    BUDGET_EXPENSE_ACCOUNT_CODE, 
    BUDGET_CASH_ACCOUNT_CODE,
} from "./account-code";
import { ASSET } from "./account-type";

const DEBIT = 1;
const CREDIT = -1;

function countBalance({ 
    accountBalanceDirection,
    ledgerEntries,
    entryIndex,
}: {
    accountBalanceDirection: number;
    ledgerEntries: (LedgerEntry & { entry: Entry })[],
    entryIndex: number,
}) {
    return ledgerEntries.reduce((acc, ledgerEntry, countingBalanceIndex) => {
        if (countingBalanceIndex > entryIndex) {
            return acc;
        }

        return acc + ledgerEntry.entry.amount * BigInt(ledgerEntry.entry.direction) * BigInt(accountBalanceDirection);
    }, BigInt(0));
}

export async function createBudgetProcedure(
    client: PrismaClient,
    { name, amount }: { name: string; amount: bigint }

) {
    const cashAccount = await client.account.findFirst({
        where: {
            accountCode: { code: CASH_ACCOUNT_CODE },
        }
    });

    const budgetCashAccountSupercode = await client.accountCode.findFirst({
        where: { code: BUDGET_CASH_ACCOUNT_CODE }
    });
    
    const latestBudgetCashAccountSubcode = await client.accountCode.findFirst({
        where: { accountSupercodeId: budgetCashAccountSupercode.id },
        orderBy: {
            code: "desc",
        },
    });

    const budgetCashAccountSubcode = await client.accountCode.create({
        data: {
            accountSupercode: { connect: { id: budgetCashAccountSupercode.id } },
            code: latestBudgetCashAccountSubcode ? latestBudgetCashAccountSubcode.code + 1 : 1,
        }
    });

    const budgetCashAccount = await client.account.create({
        data: {
            name: `${name} (cash account)`,
            accountCode: { connect: { id: budgetCashAccountSubcode.id } },
            accountType: { connect: { name: ASSET } }
        }
    });

    const budgetExpenseAccountSupercode = await client.accountCode.findFirst({
        where: { code: BUDGET_EXPENSE_ACCOUNT_CODE }
    });
    
    const latestBudgetExpenseAccountSubcode = await client.accountCode.findFirst({
        where: { accountSupercodeId: budgetExpenseAccountSupercode.id },
        orderBy: {
            code: "desc",
        },
    });

    const budgetExpenseAccountSubcode = await client.accountCode.create({
        data: {
            accountSupercode: { connect: { id: budgetExpenseAccountSupercode.id } },
            code: latestBudgetExpenseAccountSubcode ? latestBudgetExpenseAccountSubcode.code + 1 : 1,
        }
    });

    const budgetExpenseAccount = await client.account.create({
        data: {
            name: `${name} (expense account)`,
            accountCode: { connect: { id: budgetExpenseAccountSubcode.id } },
            accountType: { connect: { name: ASSET } }
        }
    });

    await client.ledger.create({
        data: {
            account: { connect: { id: budgetCashAccount.id } },
            balance: BigInt(0),
        },
    });

    await client.ledger.create({
        data: {
            account: { connect: { id: budgetExpenseAccount.id } },
            balance: BigInt(0),
        },
    });

    await journalizeProcedure(client, { 
        debitAccountId: budgetCashAccount.id, 
        creditAccountId: cashAccount.id,
        amount, 
        description: "saldo awal",
    });

    return await client.budget.create({
        data: {
            name,
            cashAccount: { connect: { id: budgetCashAccount.id } },
            expenseAccount: { connect: { id: budgetExpenseAccount.id } },
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
    const budget = await client.budget.findUnique({
        where: {
            id: budgetId,
        },
        include: {
            cashAccount: true,
            expenseAccount: true,
        },
    });

    const budgetCashAccount = budget.cashAccount;
    const expenseAccount = budget.expenseAccount;

    return await journalizeProcedure(client, {  
        debitAccountId: expenseAccount.id, 
        creditAccountId: budgetCashAccount.id,
        amount, 
        description: description
    });
};

export async function balanceLedgerProcedure(client: PrismaClient, { id }: { id: number }) {
    const ledger = await client.ledger.findUnique({
        where: {
            id,
        },
        include: {
            entries: {
                include: {
                    entry: true,
                },
            },
            account: {
                include: {
                    accountType: true,
                },
            },
        },
    });

    const accountBalanceDirection = ledger.account.accountType.direction;

    await Promise.all(ledger.entries.map(async (ledgerEntry, entryIndex, ledgerEntries) => {
        const balance = countBalance({ accountBalanceDirection, ledgerEntries, entryIndex });

        await client.ledgerEntry.update({
            where: {
                id: ledgerEntry.id,
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
        + amount * BigInt(DEBIT) * BigInt(debitAccount.accountType.direction);
    const creditBalance = openCreditLedger.balance
        + amount * BigInt(CREDIT) * BigInt(creditAccount.accountType.direction);

    const debitEntry = await client.entry.create({
        data: {
            journal: { connect: { id: journal.id } },
            direction: DEBIT,
            amount,
        },
    });

    const creditEntry = await client.entry.create({
        data: {
            journal: { connect: { id: journal.id } },
            direction: CREDIT,
            amount,
        },
    });

    await client.ledgerEntry.create({
        data: {
            entry: { connect: { id: debitEntry.id } },
            ledger: { connect: { id: openDebitLedger.id } },
            balance: debitBalance,
        },
    }),

    await client.ledgerEntry.create({
        data: {
            entry: { connect: { id: creditEntry.id } },
            ledger: { connect: { id: openCreditLedger.id } },
            balance: creditBalance,
        },
    }),

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

export async function deleteBudgetProcedure(client: PrismaClient, { id }: { id: number }) {
    const budget = await client.budget.findUnique({
        where: {
            id,
        },
    });

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
            id: budget.cashAccountId,
        },
        data: {
            active: false,
        },
    });

    await client.account.update({
        where: {
            id: budget.expenseAccountId,
        },
        data: {
            active: false,
        },
    });

    return budget;
}