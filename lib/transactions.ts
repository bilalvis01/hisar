import type { PrismaClient, Account, Ledger, Entry, AccountCode } from "@prisma/client";

type LedgerEntry = Ledger & { entries: (Entry & { account: Account & { accountCode: AccountCode } })[] };

async function refundProcedure({
    client,
    code,
    skipUpdateBalance = false,
}: {
    client: PrismaClient;
    code: number;
    skipUpdateBalance?: boolean;
}) {
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
    
    const senderEntry = ledgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const recipientEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const senderAccount = senderEntry.account;
    const recipientAccount = recipientEntry.account;

    const correctionLedgerEntry = await entryProcedure(client, recipientAccount.id, senderAccount.id, senderEntry.amount, "refund");

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
        await updateBalanceProcedure({ client, code });
    }

    return ledgerEntry;
}

async function updateLedgerEntryBudgetAccountProcedure({
    client,
    code,
    budgetAccountId,
    amount,
}: {
    client: PrismaClient;
    code: number;
    budgetAccountId: number;
    amount: bigint;
}) {
    const ledgerEntry = await refundProcedure({ client, code, skipUpdateBalance: true });

    const recipientEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const recipientAccount = recipientEntry.account;

    const newLedgerEntry = await entryProcedure(client, budgetAccountId, recipientAccount.id, amount, ledgerEntry.description);

    await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: ledgerEntry.code,
            createdAt: ledgerEntry.createdAt,
        },
    });

    await updateBalanceProcedure({ client, code });

    return newLedgerEntry;
}

async function updateLedgerEntryAmountProcedure({
    client,
    code,
    amount,
}: {
    client: PrismaClient;
    code: number;
    amount: bigint;
}) {
    const ledgerEntry = await refundProcedure({ client, code, skipUpdateBalance: true });

    const senderEntry = ledgerEntry.entries.filter((entry) => entry.direction === -1)[0];
    const recipientEntry = ledgerEntry.entries.filter((entry) => entry.direction === 1)[0];

    const senderAccount = senderEntry.account;
    const recipientAccount = recipientEntry.account;

    const newLedgerEntry = await entryProcedure(client, senderAccount.id, recipientAccount.id, amount, ledgerEntry.description);

    await client.ledger.update({
        where: {
            id: newLedgerEntry.id,
        },
        data: {
            code: ledgerEntry.code,
            createdAt: ledgerEntry.createdAt,
        },
    });

    await updateBalanceProcedure({ client, code });

    return newLedgerEntry;
}

async function updateBalanceProcedure({
    client,
    code,
}: {
    client: PrismaClient;
    code: number;
}) {
    const ledgerEntryRightBeforeCurrentLedgetEntry = await client.ledger.findFirst({
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

    const senderEntry = ledgerEntryRightBeforeCurrentLedgetEntry.entries.filter((entry) => entry.direction === -1)[0];
    const recipientEntry = ledgerEntryRightBeforeCurrentLedgetEntry.entries.filter((entry) => entry.direction === 1)[0];

    const senderAccount = senderEntry.account;
    const recipientAccount = recipientEntry.account;

    let senderBalance = 
        senderEntry.balance - senderEntry.amount * BigInt(senderEntry.direction) * BigInt(senderAccount.direction);
    let recipientBalance = 
        recipientEntry.balance - recipientEntry.amount * BigInt(recipientEntry.direction) * BigInt(recipientAccount.direction);

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

    const senderEntries = ledgerEntries.map((ledgerEntry) => {
        return ledgerEntry.entries.filter((entry) => entry.account.id === senderAccount.id)[0];
    });

    const recipientEntries = ledgerEntries.map((ledgerEntry) => {
        return ledgerEntry.entries.filter((entry) => entry.account.id === recipientAccount.id)[0];
    });

    await Promise.all(senderEntries.map(async (entry) => {
        senderBalance += entry.amount * BigInt(entry.direction) * BigInt(senderAccount.direction);
        await client.entry.update({
            where: {
                id: entry.id
            },
            data: {
                balance: senderBalance,
            },
        });
    }));

    await Promise.all(recipientEntries.map(async (entry) => {
        recipientBalance += entry.amount * BigInt(entry.direction) * BigInt(recipientAccount.direction);
        await client.entry.update({
            where: {
                id: entry.id
            },
            data: {
                balance: recipientBalance,
            },
        });
    }));

    await client.account.update({
        where: {
            id: senderAccount.id,
        },
        data: {
            balance: senderBalance,
        },
    });

    await client.account.update({
        where: {
            id: recipientAccount.id,
        },
        data: {
            balance: recipientBalance,
        },
    });
};

async function entryProcedure(client: PrismaClient, senderId: number, recipientId: number, amount: bigint, description: string) {
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
    const senderDirection = -1;
    const recipientDirection = 1;
    const sender = await client.account.findUnique({
        where: {
            id: senderId,
        },
    });
    const recipient = await client.account.findUnique({
        where: {
            id: recipientId,
        },
    });
    const senderBalance = sender.balance + amount * BigInt(sender.direction) * BigInt(senderDirection);
    const recipientBalance = recipient.balance + amount * BigInt(recipient.direction) * BigInt(recipientDirection);
    await client.account.update({
        where: {
            id: senderId
        },
        data: {
            balance: senderBalance,
        }
    });
    await client.account.update({
        where: {
            id: recipientId
        },
        data: {
            balance: recipientBalance,
        }
    });
    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: senderId,
            amount: amount,
            balance: senderBalance,
            direction: senderDirection,
        },
    });
    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: recipientId,
            amount: amount,
            balance: recipientBalance,
            direction: recipientDirection,
        },
    });
    
    return await client.ledger.findUnique({
        where: {
            id: ledger.id,
        },
        include: { entries: { include: { account: true } } },
    });
}

async function deleteBudgetProcedure(client: PrismaClient, id: number) {
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

export async function entry(client: PrismaClient, senderId: number, recipientId: number, amount: bigint, description: string) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await entryProcedure(tx, senderId, recipientId, amount, description);
    });
}

export async function createBudget(client: PrismaClient, name: string, budget: bigint) {
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
        const ledger = await entryProcedure(tx, cashAccount.id, budgetAccount.id, budget, "saldo awal");
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
            await entryProcedure(tx, cashAccount.id, budgetAccount.id, topup, "topup saldo");
        }

        if (balance < budgetAccount.balance) {
            const refund = budgetAccount.balance - balance;
            await entryProcedure(tx, budgetAccount.id, cashAccount.id, refund, "refund saldo");
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

export async function deleteBudget(client: PrismaClient, id: number) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await deleteBudgetProcedure(tx, id);
    });
} 

export async function deleteBudgetMany(client: PrismaClient, ids: number[]) {
    return await client.$transaction(async (tx: PrismaClient) => {
        return await Promise.all(ids.map(id => deleteBudgetProcedure(tx, id)));
    });
} 

export async function updateExpense(
    client: PrismaClient, 
    { code, budgetAccountId, description, amount }: { code: number; budgetAccountId: number; description: string; amount: bigint }
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
            const newLedgerEntry = await updateLedgerEntryBudgetAccountProcedure({ client, code, budgetAccountId, amount });
            ledgerEntryId = newLedgerEntry.id;
            skipUpdateLedgerEntryAmount = true;
        }

        if (expenseEntry.amount !== amount && !skipUpdateLedgerEntryAmount) {
            const newLedgerEntry = await updateLedgerEntryAmountProcedure({ client, code, amount });
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