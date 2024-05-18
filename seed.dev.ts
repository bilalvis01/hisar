import { PrismaClient } from '@prisma/client';
import { entry, createBudget } from "./lib/transactions";

const prisma = new PrismaClient();

const CASH_ACCOUNT_CODE = 100;
const EXPENSE_ACCOUNT_CODE = 200;
const BUDGET_ACCOUNT_CODE = 101;

async function main() {
    await prisma.state.createMany({
        data: [
            {
                id: 1,
                desciption: "active",
            },
            {
                id: 2,
                desciption: "archived",
            },
            {
                id: 3,
                desciption: "soft_deleted",
            },
            {
                id: 4,
                desciption: "corrected",
            },
        ],
    });
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
                accountCodeId: cashAccountCode.id,
                name: "cash account",
                balance: 1_000_000_000_0000,
                direction: 1,
            },
            {
                accountCodeId: expenseAccountCode.id,
                name: "expense account",
                balance: 0,
                direction: 1,
            },
        ],
    });
    const expenseAccount = await prisma.account.findFirst({
        where: {
            accountCodeId: expenseAccountCode.id,
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