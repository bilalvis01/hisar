import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CASH_ACCOUNT = 1;
const EXPENSE_ACCOUNT = 2;
const BUDGET_PERALATAN = 3;
const BUDGET_MAKAN = 4;
const BUDGET_TRANSPORTASI = 5;

async function transfer(senderId: number, recipientId: number, amount: bigint, description: string) {
    return await prisma.$transaction(async (tx) => {
        const ledger = await tx.ledger.create({
            data: {
                description,
            },
        });
        const sender = await tx.account.findUnique({
            where: {
                id: senderId,
            },
        });
        const recipient = await tx.account.findUnique({
            where: {
                id: recipientId,
            },
        });
        const senderBalance = sender.balance - amount;
        const recipientBalance = recipient.balance + amount;
        await tx.account.update({
            where: {
                id: senderId
            },
            data: {
                balance: senderBalance,
            }
        });
        await tx.account.update({
            where: {
                id: recipientId
            },
            data: {
                balance: recipientBalance,
            }
        });
        await tx.entry.create({
            data: {
                ledgerId: ledger.id,
                accountId: senderId,
                amount: amount,
                balance: senderBalance,
                direction: -1,
            },
        });
        await tx.entry.create({
            data: {
                ledgerId: ledger.id,
                accountId: recipientId,
                amount: amount,
                balance: recipientBalance,
                direction: 1,
            },
        });
        
        return await tx.ledger.findUnique({
            where: {
                id: ledger.id,
            },
            include: {
                entries: true,
            },
        });
    }, {
        maxWait: 5000,
        timeout: 10000,
    });
}

async function main() {
    await prisma.account.createMany({
        data: [
            {
                id: CASH_ACCOUNT,
                name: "cash",
                type: "asset",
                balance: 1_000_000_000_00
            },
            {
                id: EXPENSE_ACCOUNT,
                name: "expense",
                type: "expense",
                balance: 0,
            },
            {
                id: BUDGET_PERALATAN,
                name: "Budget Peralatan",
                type: "budget",
                balance: 0,
            },
            {
                id: BUDGET_MAKAN,
                name: "Budget Makan",
                type: "budget",
                balance: 0,
            },
            {
                id: BUDGET_TRANSPORTASI,
                name: "Budget Transportasi",
                type: "budget",
                balance: 0,
            },
        ],
    });

    await transfer(CASH_ACCOUNT, BUDGET_PERALATAN, BigInt(2_000_000_00), "tambah saldo budget peralatan");
    await transfer(CASH_ACCOUNT, BUDGET_MAKAN, BigInt(2_000_000_00), "tambah saldo budget makan");
    await transfer(CASH_ACCOUNT, BUDGET_TRANSPORTASI, BigInt(1_500_000_00), "tambah saldo budget transportasi");
    await transfer(BUDGET_PERALATAN, EXPENSE_ACCOUNT, BigInt(300_000_00), "beli sapu");
    await transfer(BUDGET_PERALATAN, EXPENSE_ACCOUNT, BigInt(200_000_00), "beli pengki");
    await transfer(BUDGET_MAKAN, EXPENSE_ACCOUNT, BigInt(300_000_00), "beli minum");
    await transfer(BUDGET_MAKAN, EXPENSE_ACCOUNT, BigInt(300_000_00), "beli makan pagi");
    await transfer(BUDGET_MAKAN, EXPENSE_ACCOUNT, BigInt(300_000_00), "beli makan malam");
    await transfer(BUDGET_MAKAN, EXPENSE_ACCOUNT, BigInt(300_000_00), "beli makan sore");
    await transfer(BUDGET_TRANSPORTASI, EXPENSE_ACCOUNT, BigInt(60_000_00), "naik gojek berangkat");
    await transfer(BUDGET_TRANSPORTASI, EXPENSE_ACCOUNT, BigInt(60_000_00), "naik gojek pulang");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })