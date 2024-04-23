import { PrismaClient } from '@prisma/client';
import { entry, createBudget } from "./lib/transaction";

const prisma = new PrismaClient();

const CASH_ACCOUNT_CODE = 100;
const EXPENSE_ACCOUNT_CODE = 200;
const BUDGET_ACCOUNT_CODE = 101;

async function main() {
    await prisma.accountCode.createMany({
        data: [
            {
                code: CASH_ACCOUNT_CODE,
                category: "asset",
            },
            {
                code: EXPENSE_ACCOUNT_CODE,
                category: "expense",
            },
            {
                code: BUDGET_ACCOUNT_CODE,
                category: "budget",
            }
        ]
    });
    const cashAccountCode = await prisma.accountCode.findFirst({
        where: {
            code: CASH_ACCOUNT_CODE,
        }
    });
    const expenseAccountCode = await prisma.accountCode.findFirst({
        where: {
            code: EXPENSE_ACCOUNT_CODE,
        }
    });
    await prisma.account.createMany({
        data: [
            {
                codeId: cashAccountCode.id,
                name: "cash account",
                balance: 1_000_000_000_0000
            },
            {
                codeId: expenseAccountCode.id,
                name: "expense account",
                balance: 0,
            },
        ],
    });
    const expenseAccount = await prisma.account.findFirst({
        where: {
            codeId: expenseAccountCode.id,
        }
    });
    const budgetPeralatan = await createBudget(prisma, "budget peralatan", BigInt(2_000_000_0000));
    const budgetMakan = await createBudget(prisma, "budget makan", BigInt(2_000_000_0000));
    const budgetTransportasi = await createBudget(prisma, "budget tranportasi", BigInt(1_500_000_0000));
    await entry(prisma, budgetPeralatan.id, expenseAccount.id, BigInt(300_000_0000), "beli sapu");
    await entry(prisma, budgetPeralatan.id, expenseAccount.id, BigInt(200_000_0000), "beli pengki");
    await entry(prisma, budgetMakan.id, expenseAccount.id, BigInt(300_000_0000), "beli minum");
    await entry(prisma, budgetMakan.id, expenseAccount.id, BigInt(300_000_0000), "beli makan pagi");
    await entry(prisma, budgetMakan.id, expenseAccount.id, BigInt(300_000_0000), "beli makan malam");
    await entry(prisma, budgetMakan.id, expenseAccount.id, BigInt(300_000_0000), "beli makan sore");
    await entry(prisma, budgetTransportasi.id, expenseAccount.id, BigInt(60_000_0000), "naik gojek berangkat");
    await entry(prisma, budgetTransportasi.id, expenseAccount.id, BigInt(60_000_0000), "naik gojek pulang");
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