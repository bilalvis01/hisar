import type { PrismaClient } from "@prisma/client";

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
    const ledgerEntry = await client.ledger.findFirst({
        where: {
            code,
            stateId: 1,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
    });
    
    const creditEntry = ledgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    const correctionLedgerEntry = await entryProcedure(
        client, 
        {
            debitId: debitAccount.id, 
            creditId: creditAccount.id, 
            amount: creditEntry.amount, 
            description: "refund"
        }
    );

    await client.ledger.update({
        where: {
            id: correctionLedgerEntry.id,
        },
        data: {
            stateId: 4,
            code: ledgerEntry.code,
            correctedLedgerId: ledgerEntry.id,
            createdAt: ledgerEntry.createdAt,
        },
    });

    await client.ledger.update({
        where: {
            id: ledgerEntry.id,
        },
        data: {
            stateId: 4,
        },
    });

    if (!skipUpdateBalance) {
        await updateBalanceProcedure(client, { code });
    }

    return ledgerEntry;
}

async function updateLedgerEntryBudgetAccountProcedure(
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
    const ledgerEntry = await refundProcedure(
        client, 
        { code, skipUpdateBalance: true }
    );

    const debitEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const debitAccount = debitEntry.account;

    const newLedgerEntry = await entryProcedure(
        client, 
        {
            creditId: budgetAccountId, 
            debitId: debitAccount.id, 
            amount: amount, 
            description: ledgerEntry.description,
        }  
    );

    await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: ledgerEntry.code,
            createdAt: ledgerEntry.createdAt,
        },
    });

    await updateBalanceProcedure(client, { code });

    return newLedgerEntry;
}

async function updateLedgerEntryAmountProcedure(
    client: PrismaClient,
    { code, amount }: { code: number; amount: bigint }
) {
    const ledgerEntry = await refundProcedure(
        client, { code, skipUpdateBalance: true }
    );

    const creditEntry = ledgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    const newLedgerEntry = await entryProcedure(client, {
        creditId: creditAccount.id, 
        debitId: debitAccount.id, 
        amount, 
        description: ledgerEntry.description
    });

    await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: ledgerEntry.code,
            createdAt: ledgerEntry.createdAt,
        },
    });

    await updateBalanceProcedure(client, { code });

    return newLedgerEntry;
}

async function updateBalanceProcedure(
    client: PrismaClient,
    { code }: { code: number }
) {
    const ledgerEntryRightBeforeCurrentLedgerEntry = await client.ledger.findFirst({
        where: {
            code: {
                lt: code,
            },
            stateId: 1,
        },
        include: {
            entries: {
                include: {
                    account: true,
                },
            },
        },
        orderBy: {
            code: "desc",
        },
    });

    const creditEntry = ledgerEntryRightBeforeCurrentLedgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = ledgerEntryRightBeforeCurrentLedgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    let creditBalance = 
        creditEntry.balance - creditEntry.amount * BigInt(creditEntry.direction) * BigInt(creditAccount.direction);
    let debitBalance = 
        debitEntry.balance - debitEntry.amount * BigInt(debitEntry.direction) * BigInt(debitAccount.direction);

    const ledgerEntries = await client.ledger.findMany({
        where: {
            code: {
                gte: code,
            },
            stateId: 1
        },
        include: {
            entries: {
                include: {
                    account: true,
                }
            },
        },
        orderBy: {
            code: "asc"
        },
    });

    const creditEntries = ledgerEntries.map((ledgerEntry) => {
        return ledgerEntry.entries.filter((entry) => entry.account.id === creditAccount.id)[0];
    });

    const debitEntries = ledgerEntries.map((ledgerEntry) => {
        return ledgerEntry.entries.filter((entry) => entry.account.id === debitAccount.id)[0];
    });

    await Promise.all(creditEntries.map(async (entry) => {
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

    await Promise.all(debitEntries.map(async (entry) => {
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

async function entryProcedure(
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
    const ledger = await client.ledger.create({
        data: {
            description,
        },
    });
    await client.ledger.update({
        where: {
            id: ledger.id,
        },
        data: {
            code: ledger.id,
        },
    });
    const creditDirection = -1;
    const debitDirection = 1;
    const credit = await client.account.findUnique({
        where: {
            id: creditId,
        },
    });
    const debit = await client.account.findUnique({
        where: {
            id: debitId,
        },
    });
    const creditBalance = credit.balance + amount * BigInt(credit.direction) * BigInt(creditDirection);
    const debitBalance = debit.balance + amount * BigInt(debit.direction) * BigInt(debitDirection);
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
    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: creditId,
            amount: amount,
            balance: creditBalance,
            direction: creditDirection,
        },
    });
    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: debitId,
            amount: amount,
            balance: debitBalance,
            direction: debitDirection,
        },
    });
    
    return await client.ledger.findUnique({
        where: {
            id: ledger.id,
        },
        include: { entries: { include: { account: true } } },
    });
}

async function deleteBudgetProcedure(client: PrismaClient, { id }: { id: number }) {
    await client.ledger.updateMany({
        where: {
            entries: {
                some: {
                    accountId: id,
                }
            }
        },
        data: {
            stateId: 3,
        }
    });

    return await client.account.update({
        where: {
            id,
        },
        data: {
            stateId: 3,
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
    { name, budget }: { name: string; budget: bigint }
) {
    return await client.$transaction(async (tx: PrismaClient) => {
        const budgetAccountCode = await client.accountCode.findFirst({
            where: { code: 101 }
        });
        const latestSubBudgetCode = await client.accountCode.aggregate({
            where: { accountSupercodeId: budgetAccountCode.id },
            _max: { code: true },
        });
        const subBudgetCode = await client.accountCode.create({
            data: {
                accountSupercodeId: budgetAccountCode.id,
                code: latestSubBudgetCode._max.code + 1,
                category: "budget",
            }
        });
        const budgetAccount = await client.account.create({
            data: {
                name: name,
                accountCodeId: subBudgetCode.id,
                balance: 0,
                direction: 1,
            }
        });
        const cashAccountCode = await client.accountCode.findFirst({
            where: {
                code: 100,
            }
        });
        const cashAccount = await client.account.findFirst({
            where: {
                accountCodeId: cashAccountCode.id,
            }
        });
        const ledger = await entryProcedure(tx, {
            creditId: cashAccount.id, 
            debitId: budgetAccount.id, 
            amount: budget, 
            description: "saldo awal",
        });
        return await client.account.findUnique({
            where: { id: budgetAccount.id },
            include: {
                accountCode: {
                    include: {
                        accountSupercode: true
                    }
                }
            }
        })
    })
}

export async function updateBudget(client: PrismaClient, data: { code: number[]; name: string; balance: bigint; }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        const { code, name, balance } = data;

        const budgetAccount = await client.account.findFirst({
            where: {
                accountCode: { 
                    code: code[1], 
                    accountSupercode: { code: code[0] },
                },
            },
        });

        const cashAccountCode = await client.accountCode.findFirst({
            where: {
                code: 100,
            }
        });

        const cashAccount = await client.account.findFirst({
            where: {
                accountCodeId: cashAccountCode.id,
            }
        });

        if (budgetAccount.name !== name) {
            await client.account.update({
                where: {
                    id: budgetAccount.id,
                },
                data: {
                    name,
                }
            });
        }

        if (balance > budgetAccount.balance) {
            const topup = balance - budgetAccount.balance;
            await entryProcedure(tx, {
                creditId: cashAccount.id, 
                debitId: budgetAccount.id, 
                amount: topup, 
                description: "topup saldo",
            });
        }

        if (balance < budgetAccount.balance) {
            const refund = budgetAccount.balance - balance;
            await entryProcedure(tx, {
                creditId: budgetAccount.id, 
                debitId: cashAccount.id, 
                amount: refund, 
                description: "refund saldo",
            });
        }

        return await client.account.findFirst({
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
        const ledgerEntry = await client.ledger.findFirst({
            where: {
                code,
                stateId: 1,
            },
            include: {
                entries: {
                    include: {
                        account: {
                            include: {
                                accountCode: {
                                    include: {
                                        accountSupercode: true
                                    }
                                }
                            }
                        }
                    }
                },
            }
        });

        let skipUpdateLedgerEntryAmount = false;

        let ledgerEntryId = ledgerEntry.id;

        const budgetEntry = ledgerEntry.entries.filter((entry) => entry.account.accountCode.accountSupercode.code === 101)[0];
        const expenseEntry = ledgerEntry.entries.filter((entry) => entry.account.accountCode.code === 200)[0];

        if (budgetEntry.accountId !== budgetAccountId) {
            const newLedgerEntry = await updateLedgerEntryBudgetAccountProcedure(client, {
                code, budgetAccountId, amount 
            });
            ledgerEntryId = newLedgerEntry.id;
            skipUpdateLedgerEntryAmount = true;
        }

        if (expenseEntry.amount !== amount && !skipUpdateLedgerEntryAmount) {
            const newLedgerEntry = await updateLedgerEntryAmountProcedure(client, { code, amount });
            ledgerEntryId = newLedgerEntry.id;
        }

        if (ledgerEntry.description !== description) {
            await tx.ledger.update({
                where: {
                    id: ledgerEntryId,
                },
                data: {
                    description,
                },
            })
        }
    });
}