import type { PrismaClient } from "@prisma/client";

async function entryProcedure(client: PrismaClient, senderId: number, recipientId: number, amount: bigint, description: string) {
    const ledger = await client.ledger.create({
        data: {
            description,
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
        const ledger = await entryProcedure(tx, cashAccount.id, budgetAccount.id, budget, `tambah saldo ${name}`);
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