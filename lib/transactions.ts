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
            debitId: creditAccount.id, 
            creditId: debitAccount.id, 
            amount: debitEntry.amount, 
            description: ledgerEntry.description,
            useBalanceFromLedgerEntry: code,
            skipUpdateAccountBalance: true,
            correctionOrder: ledgerEntry.correctionOrder + 1,
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
            correctionOrder: ledgerEntry.correctionOrder + 1,
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
        await updateBalanceLedgerEntryProcedure(client, { code });
    }

    return {
        ledgerEntry,
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
    const { ledgerEntry, correctionLedgerEntry } = await refundProcedure(client, { code });

    const debitEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const debitAccount = debitEntry.account;

    let newLedgerEntry = await entryProcedure(
        client, 
        {
            creditId: budgetAccountId, 
            debitId: debitAccount.id,
            amount: amount, 
            description: ledgerEntry.description,
            useBalanceFromLedgerEntry: code,
            skipUpdateAccountBalance: true,
            correctionOrder: correctionLedgerEntry.correctionOrder + 1,
        }  
    );

    newLedgerEntry = await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: correctionLedgerEntry.code,
            correctionOrder: correctionLedgerEntry.correctionOrder + 1,
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
    const { ledgerEntry, correctionLedgerEntry } = await refundProcedure(
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
        description: ledgerEntry.description,
        useBalanceFromLedgerEntry: code,
        skipUpdateAccountBalance: true,
        correctionOrder: correctionLedgerEntry.correctionOrder + 1,
    });

    await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: ledgerEntry.code,
            correctionOrder: correctionLedgerEntry.correctionOrder + 1,
            createdAt: ledgerEntry.createdAt,
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
            { correctionOrder: "desc" },
        ],
    });

    const creditEntry = ledgerEntryLastCorrectionOrder.entries.filter((entry) => entry.direction === -1)[0];
    const debitEntry = ledgerEntryLastCorrectionOrder.entries.filter((entry) => entry.direction === 1)[0];

    const creditAccount = creditEntry.account;
    const debitAccount = debitEntry.account;

    let creditBalance = creditEntry.balance;
    let debitBalance = debitEntry.balance;

    const ledgerEntries = await client.ledger.findMany({
        where: {
            code: {
                gt: code,
            },
        },
        include: {
            entries: {
                include: {
                    account: true,
                }
            },
        },
        orderBy: [
            { code: "asc" },
            { correctionOrder: "asc" },
        ],
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
        useBalanceFromLedgerEntry,
        skipUpdateAccountBalance = false,
        correctionOrder,
    }: { 
        creditId: number, 
        debitId: number, 
        amount: bigint, 
        description: string,
        useBalanceFromLedgerEntry?: number,
        skipUpdateAccountBalance?: boolean,
        correctionOrder?: number,
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
        const lastCreditLedgerEntry = await client.ledger.findFirst({
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
                { correctionOrder: "desc" },
            ],
        });

        const lastDebitLedgerEntry = await client.ledger.findFirst({
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
                { correctionOrder: "desc" },
            ],
        });

        lastCreditBalance = lastCreditLedgerEntry.entries.filter((entry) => entry.accountId === creditId)[0].balance;
        lastDebitBalance = lastDebitLedgerEntry.entries.filter((entry) => entry.accountId === debitId)[0].balance;
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
            correctionOrder,
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
            amount: amount,
            balance: creditBalance,
            direction: creditLedgerEntryDirection,
        },
    });

    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: debitId,
            amount: amount,
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
            stateId: 1,
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
                code: latestSubBudgetCode.code + 1,
                category: "budget",
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
        const cashAccountCode = await tx.accountCode.findFirst({
            where: {
                code: 100,
            }
        });
        const cashAccount = await tx.account.findFirst({
            where: {
                accountCodeId: cashAccountCode.id,
            }
        });
        await entryProcedure(tx, {
            creditId: cashAccount.id, 
            debitId: budgetAccount.id, 
            amount: budget, 
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
        })
    })
}

export async function updateBudget(client: PrismaClient, data: { code: number[]; name: string; balance: bigint; }) {
    return await client.$transaction(async (tx: PrismaClient) => {
        const { code, name, balance } = data;

        const budgetAccount = await tx.account.findFirst({
            where: {
                accountCode: { 
                    code: code[1], 
                    accountSupercode: { code: code[0] },
                },
            },
        });

        const cashAccountCode = await tx.accountCode.findFirst({
            where: {
                code: 100,
            }
        });

        const cashAccount = await tx.account.findFirst({
            where: {
                accountCodeId: cashAccountCode.id,
            }
        });

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
            const newLedgerEntry = await changeAmountLedgerEntryProcedure(tx, { code, amount });
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