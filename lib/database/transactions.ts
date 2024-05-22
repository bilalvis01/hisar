import { PrismaClient } from "@prisma/client";
import { 
    CASH_ACCOUNT_CODE, 
    EXPENSE_ACCOUNT_CODE, 
    BUDGET_ACCOUNT_CODE,
} from "./account-code";
import { 
    ACCOUNT_SOFT_DELETED,
    ACTIVE,
    HIDE, 
} from "./state";

async function refundProcedure(
    client: PrismaClient,
    {
        code,
        skipUpdateBalance = false,
    }: {
        code: number;
        skipUpdateBalance?: boolean;
    }
) {
    let incorrectLedgerEntry = await client.ledger.findFirst({
        where: {
            code,
            state: { id: ACTIVE },
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });
    
    const creditEntry = incorrectLedgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = incorrectLedgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    let correctionLedgerEntry = await entryProcedure(
        client, 
        {
            debitId: creditAccount.id, 
            creditId: debitAccount.id, 
            amount: debitEntry.amount, 
            description: incorrectLedgerEntry.description,
            useBalanceFromLedgerEntry: code,
            skipUpdateAccountBalance: true,
        }
    );

    incorrectLedgerEntry = await client.ledger.update({
        where: {
            id: incorrectLedgerEntry.id,
        },
        data: {
            state: { connect: { id: HIDE } },
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });

    correctionLedgerEntry = await client.ledger.update({
        where: {
            id: correctionLedgerEntry.id,
        },
        data: {
            state: { connect: { id: HIDE } },
            incorrectLedger: { connect: { id: incorrectLedgerEntry.id } },
            code: incorrectLedgerEntry.code,
            createdAt: incorrectLedgerEntry.createdAt,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });

    if (!skipUpdateBalance) {
        await updateBalanceLedgerEntryProcedure(client, { code });
    }

    return {
        incorrectLedgerEntry,
        correctionLedgerEntry,
    };
}

async function changeBudgetAccountLedgerEntryProcedure(
    client: PrismaClient,
    {
        code,
        budgetAccountId,
        amount,
    }: {
        code: number;
        budgetAccountId: number;
        amount: bigint;
    }
) {
    const { incorrectLedgerEntry, correctionLedgerEntry } = await refundProcedure(client, { code });

    const debitEntry = incorrectLedgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const debitAccount = debitEntry.account;

    let newLedgerEntry = await entryProcedure(
        client, 
        {
            creditId: budgetAccountId, 
            debitId: debitAccount.id,
            amount: amount, 
            description: incorrectLedgerEntry.description,
            useBalanceFromLedgerEntry: code,
            skipUpdateAccountBalance: true,
        }  
    );

    newLedgerEntry = await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: correctionLedgerEntry.code,
            createdAt: correctionLedgerEntry.createdAt,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });

    await updateBalanceLedgerEntryProcedure(client, { code });

    return newLedgerEntry;
}

async function changeAmountLedgerEntryProcedure(
    client: PrismaClient,
    { code, amount }: { code: number; amount: bigint }
) {
    const { incorrectLedgerEntry, correctionLedgerEntry } = await refundProcedure(
        client, { code, skipUpdateBalance: true }
    );

    const creditEntry = incorrectLedgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = incorrectLedgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    let newLedgerEntry = await entryProcedure(client, {
        creditId: creditAccount.id, 
        debitId: debitAccount.id, 
        amount, 
        description: incorrectLedgerEntry.description,
        useBalanceFromLedgerEntry: code,
        skipUpdateAccountBalance: true,
    });

    newLedgerEntry = await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: incorrectLedgerEntry.code,
            createdAt: incorrectLedgerEntry.createdAt,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });

    await updateBalanceLedgerEntryProcedure(client, { code });

    return newLedgerEntry;
}

async function updateBalanceLedgerEntryProcedure(
    client: PrismaClient,
    { code }: { code: number }
) {
    const ledgerEntryLastCorrectionOrder = await client.ledger.findFirst({
        where: {
            code: code
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
        orderBy: [
            { code: "desc" },
            { id: "desc" },
        ],
    });

    const creditEntry = ledgerEntryLastCorrectionOrder.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = ledgerEntryLastCorrectionOrder.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    let creditBalance = creditEntry.balance;
    let debitBalance = debitEntry.balance;

    const creditLedgerEntries = (await client.ledger.findMany({
        where: {
            code: {
                gt: code,
            },
            entries: {
                some: {
                    accountId: creditAccount.id,
                },
            },
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
                where: {
                    accountId: creditAccount.id,
                },
            },
        },
        orderBy: [
            { code: "asc" },
            { id: "asc" },
        ],
    }));

    let debitLedgerEntries = (await client.ledger.findMany({
        where: {
            code: {
                gt: code,
            },
            entries: {
                some: {
                    accountId: debitAccount.id,
                },
            },
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
                where: {
                    accountId: debitAccount.id,
                },
            },
        },
        orderBy: [
            { code: "asc" },
            { id: "asc" },
        ],
    }));
    
    await Promise.all(creditLedgerEntries.map(async (ledgerEntry) => {
        const entry = ledgerEntry.entries[0];
        creditBalance += entry.amount * BigInt(entry.direction) * BigInt(creditAccount.direction);
        await client.entry.update({
            where: {
                id: entry.id
            },
            data: {
                balance: creditBalance,
            },
        });
    }));

    await Promise.all(debitLedgerEntries.map(async (ledgerEntry) => {
        const entry = ledgerEntry.entries[0]
        debitBalance += entry.amount * BigInt(entry.direction) * BigInt(debitAccount.direction);
        await client.entry.update({
            where: {
                id: entry.id
            },
            data: {
                balance: debitBalance,
            },
        });
    }));

    await client.account.update({
        where: {
            id: creditAccount.id,
        },
        data: {
            balance: creditBalance,
        },
    });

    await client.account.update({
        where: {
            id: debitAccount.id,
        },
        data: {
            balance: debitBalance,
        },
    });
};

/*
async function updateBudgetBalanceLedgerShadowEntryProcedure(
    client: PrismaClient,
    { id }: { id: number }
) {
    const ledgerEntries = await client.ledger.findMany({
        where: {
            entries: {
                some: {
                    account: {
                        id,
                    },
                },
            },
            state: { id: ACTIVE }
        },
        include: {
            entries: {
                include: {
                    account: true,
                    state: true,
                },
                where: {
                    account: {
                        id,
                    },
                },
            },
        },
        orderBy: { 
            code: "asc" 
        },
    });

    const primaryLedgerEntries = ledgerEntries.filter((ledgerEntry) => {
        return ledgerEntry.entries.some(
            (entry) => entry.state.id === ENTRY_PRIMARY
        );
    })
    .map(({ entries, ...ledgerEntry }) => {
        const entry = entries.filter(
            (entry) => entry.state.id === ENTRY_PRIMARY
        )[0];

        return {
            ...ledgerEntry,
            entry,
        };
    });

    const shadowLedgerEntries = ledgerEntries.filter((ledgerEntry) => {
        return ledgerEntry.entries.some(
            (entry) => entry.state.id === ENTRY_SHADOW
        );
    })
    .map(({ entries, ...ledgerEntry }) => {
        const entry = entries.filter(
            (entry) => entry.state.id === ENTRY_SHADOW
        )[0];

        return {
            ...ledgerEntry,
            entry,
        };
    });

    let balance = primaryLedgerEntries.reduce((acc, ledgerEntry) => {
        if (ledgerEntry.entry.direction === -1) return acc;

        return acc + ledgerEntry.amount;
    }, BigInt(0));

    console.log(balance);

    await Promise.all(shadowLedgerEntries.map(async (shadowLedgerEntry) => {
        await client.entry.update({
            where: {
                id: shadowLedgerEntry.entry.id,
            },
            data: {
                balance,
            },
        });

        balance -= shadowLedgerEntry.amount;
    }));
};
*/

async function entryProcedure(
    client: PrismaClient,
    {
        creditId,
        debitId,
        amount,
        description,  
        useBalanceFromLedgerEntry,
        skipUpdateAccountBalance = false,
    }: { 
        creditId: number, 
        debitId: number, 
        amount: bigint, 
        description: string,
        useBalanceFromLedgerEntry?: number,
        skipUpdateAccountBalance?: boolean,
    }
) {
    const creditAccount = await client.account.findUnique({
        where: {
            id: creditId,
        },
    });

    const debitAccount = await client.account.findUnique({
        where: {
            id: debitId,
        },
    });

    let lastCreditBalance;
    let lastDebitBalance;

    if (useBalanceFromLedgerEntry) {
        const creditLedgerEntry = await client.ledger.findFirst({
            where: {
                code: {
                    lte: useBalanceFromLedgerEntry,
                },
                entries: {
                    some: {
                        accountId: creditId,
                    },
                },
            },
            include: {
                entries: {
                    include: {
                        account: true,
                    },
                },
            },
            orderBy: [
                { code: "desc" },
                { id: "desc" },
            ],
        });

        const debitLedgerEntry = await client.ledger.findFirst({
            where: {
                code: {
                    lte: useBalanceFromLedgerEntry,
                },
                entries: {
                    some: {
                        accountId: debitId,
                    }
                }
            },
            include: {
                entries: {
                    include: {
                        account: true,
                    },
                },
            },
            orderBy: [
                { code: "desc" },
                { id: "desc" },
            ],
        });

        lastCreditBalance = creditLedgerEntry.entries.filter((entry) => entry.accountId === creditId)[0].balance;
        lastDebitBalance = debitLedgerEntry.entries.filter((entry) => entry.accountId === debitId)[0].balance;
    } else {
        lastCreditBalance = creditAccount.balance;
        lastDebitBalance = debitAccount.balance;
    }

    const creditLedgerEntryDirection = -1;
    const debitLedgerEntryDirection = 1;

    const creditBalance = lastCreditBalance + amount * BigInt(creditAccount.direction) * BigInt(creditLedgerEntryDirection);
    const debitBalance = lastDebitBalance + amount * BigInt(debitAccount.direction) * BigInt(debitLedgerEntryDirection);

    let ledger = await client.ledger.create({
        data: {
            description,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });

    ledger = await client.ledger.update({
        where: {
            id: ledger.id,
        },
        data: {
            code: ledger.id,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });

    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: creditId,
            amount,
            balance: creditBalance,
            direction: creditLedgerEntryDirection,
        },
    });

    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: debitId,
            amount,
            balance: debitBalance,
            direction: debitLedgerEntryDirection,
        },
    });

    if (!skipUpdateAccountBalance) {
        await client.account.update({
            where: {
                id: creditId
            },
            data: {
                balance: creditBalance,
            }
        });
    
        await client.account.update({
            where: {
                id: debitId
            },
            data: {
                balance: debitBalance,
            }
        });
    }

    return ledger;
}

async function deleteBudgetProcedure(client: PrismaClient, { id }: { id: number }) {
    await client.ledger.updateMany({
        where: {
            entries: {
                some: {
                    accountId: id,
                }
            },
            state: { id: ACTIVE },
        },
        data: {
            stateId: ACCOUNT_SOFT_DELETED,
        }
    });

    return await client.account.update({
        where: {
            id,
        },
        data: {
            stateId: ACCOUNT_SOFT_DELETED,
        },
        include: {
            accountCode: {
                include: {
                    accountSupercode: true,
                }
            }
        },
    });
}

export async function entry(
    client: PrismaClient,
    {
        creditId,
        debitId,
        amount,
        description,
    }: {
        creditId: number, 
        debitId: number, 
        amount: bigint, 
        description: string
    }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await entryProcedure(tx, { 
            creditId: creditId, 
            debitId: debitId, 
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
        const budgetAccountCode = await tx.accountCode.findFirst({
            where: { code: 101 }
        });
        
        const latestSubBudgetCode = await tx.accountCode.findFirst({
            where: { accountSupercodeId: budgetAccountCode.id },
            orderBy: {
                code: "desc",
            },
        });

        const subBudgetCode = await tx.accountCode.create({
            data: {
                accountSupercodeId: budgetAccountCode.id,
                code: latestSubBudgetCode ? latestSubBudgetCode.code + 1 : 1,
            }
        });

        const budgetAccount = await tx.account.create({
            data: {
                name: name,
                accountCodeId: subBudgetCode.id,
                balance: 0,
                direction: 1,
            }
        });

        const cashAccount = await tx.account.findFirst({
            where: {
                accountCode: { code: 100 },
            }
        });

        const ledgerEntry = await entryProcedure(tx, {
            creditId: cashAccount.id, 
            debitId: budgetAccount.id, 
            amount, 
            description: "saldo awal",
        });

        return await tx.account.findUnique({
            where: { id: budgetAccount.id },
            include: {
                accountCode: {
                    include: {
                        accountSupercode: true
                    }
                }
            }
        });
    })
}

export async function updateBudget(client: PrismaClient, {
    code, name, amount
}: { code: number[]; name: string; amount: bigint; }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        const budgetAccount = await tx.account.findFirst({
            where: {
                accountCode: { 
                    code: code[1], 
                    accountSupercode: { code: code[0] },
                },
            },
        });

        const cashAccount = await tx.account.findFirst({
            where: {
                accountCode: {
                    code: CASH_ACCOUNT_CODE,
                },
            },
        });

        const firstLedgerEntry = await tx.ledger.findFirst({
            where: {
                entries: {
                    some: {
                        account: {
                            id: budgetAccount.id,
                        },
                    },
                },
                state: {
                    id: ACTIVE,
                },
            },
            include: {
                entries: {
                    where: {
                        account: {
                            id: budgetAccount.id,
                        },
                    },
                },
            },
            orderBy: {
                code: "desc",
            },
        });
        
        const currentBudget = firstLedgerEntry.entries[0].amount;

        if (budgetAccount.name !== name) {
            await tx.account.update({
                where: {
                    id: budgetAccount.id,
                },
                data: {
                    name,
                }
            });
        }

        if (currentBudget !== amount) {
            await refundProcedure(tx, {
                code: firstLedgerEntry.code,
            });

            const newLedgerEntry = await entryProcedure(tx, {
                debitId: budgetAccount.id,
                creditId: cashAccount.id,
                amount,
                description: firstLedgerEntry.description,
            });

            await tx.ledger.update({
                where: {
                    id: newLedgerEntry.id,
                },
                data: {
                    code: firstLedgerEntry.code,
                },
            })
        }

        return await tx.account.findUnique({
            where: {
                id: budgetAccount.id,
            },
            include: {
                accountCode: {
                    include: {
                        accountSupercode: true
                    }
                }
            },
        });
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
        budgetAccountId,
        description,
        amount,
    }: {
        budgetAccountId: number,
        description: string,
        amount: bigint,
    }
) {
    await client.$transaction(async (tx: PrismaClient) => {
        const expenseAccount = await tx.account.findFirst({
            where: { accountCode: { code: EXPENSE_ACCOUNT_CODE } }
        });

        const budgetAccount = await tx.account.findUnique({
            where: { id: budgetAccountId },
            include: { 
                accountCode: {
                    include: {
                        accountSupercode: true,
                    },
                },
            },
        });

        if (budgetAccount.accountCode.accountSupercode.code !== BUDGET_ACCOUNT_CODE) {
            throw Error("credit account must be a budget account");
        }

        return await entryProcedure(tx, { 
            creditId: budgetAccount.id, 
            debitId: expenseAccount.id, 
            amount, 
            description: description
        });
    });
}

export async function updateExpense(
    client: PrismaClient, 
    { 
        code, 
        budgetAccountId, 
        description, 
        amount 
    }: { 
        code: number; 
        budgetAccountId: number; 
        description: string; 
        amount: bigint 
    }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        async function fetchLedgerEntry() {
            return await tx.ledger.findFirst({
                where: {
                    code,
                    state: { id: ACTIVE },
                },
                include: {
                    entries: {
                        include: {
                            account: {
                                include: {
                                    accountCode: {
                                        include: {
                                            accountSupercode: true
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }

        const ledgerEntry = await fetchLedgerEntry();

        let skipUpdateLedgerEntryAmount = false;

        let ledgerEntryId = ledgerEntry.id;

        const budgetEntry = ledgerEntry.entries.filter((entry) => entry.account.accountCode.accountSupercode?.code === 101)[0];
        const expenseEntry = ledgerEntry.entries.filter((entry) => entry.account.accountCode.code === 200)[0];

        if (budgetEntry.accountId !== budgetAccountId) {
            const newLedgerEntry = await changeBudgetAccountLedgerEntryProcedure(tx, {
                code, budgetAccountId, amount 
            });
            ledgerEntryId = newLedgerEntry.id;
            skipUpdateLedgerEntryAmount = true;
        }

        if (expenseEntry.amount !== amount && !skipUpdateLedgerEntryAmount) {
            const newLedgerEntry = await changeAmountLedgerEntryProcedure(tx, { 
                code, amount 
            });
            ledgerEntryId = newLedgerEntry.id;
        }

        if (ledgerEntry.description !== description) {
            await tx.ledger.updateMany({
                where: {
                    code,
                },
                data: {
                    description,
                },
            })
        }

        return await fetchLedgerEntry();
    });
}