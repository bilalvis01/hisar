import type { PrismaClient } from "@prisma/client";

async function entryProcedure(client: PrismaClient, senderId: number, recipientId: number, amount: bigint, description: string) {
    const ledger = await client.ledger.create({
        data: {
            description,
        },
    });
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
    const senderBalance = sender.balance - amount;
    const recipientBalance = recipient.balance + amount;
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
            direction: -1,
        },
    });
    await client.entry.create({
        data: {
            ledgerId: ledger.id,
            accountId: recipientId,
            amount: amount,
            balance: recipientBalance,
            direction: 1,
        },
    });
    
    return await client.ledger.findUnique({
        where: {
            id: ledger.id,
        },
        include: {
            entries: {
                include: {
                    account: true,
                }
            },
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
        const budgetAccount = await client.account.create({
            data: {
                name: name,
                type: "asset",
                code: 101,
                balance: 0,
            }
        });
        const cashAccount = await client.account.findFirst({
            where: {
                code: 100,
            }
        });
        const ledger = await entryProcedure(tx, cashAccount.id, budgetAccount.id, budget, `tambah saldo ${name}`);
        return budgetAccount
    })
}