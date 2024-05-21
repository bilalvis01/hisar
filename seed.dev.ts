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
                name: "active",
            },
            {
                id: 10,
                name: "account_soft_deleted",
            },
            { 
                id: 20,
                name: "ledger_soft_deleted",
            },
            {
                id: 21,
                name: "ledger_corrected",
            },
            {
                id: 30,
                name: "entry_primary",
            },
            {
                id: 32,
                name: "entry_shadow",
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
    const budgetPeralatan = await createBudget(prisma, { 
        name: "budget peralatan", 
        budget: BigInt(2_000_000_0000),
    });
    const budgetMakan = await createBudget(prisma, {
        name: "budget makan", 
        budget: BigInt(2_000_000_0000),
    });
    const budgetTransportasi = await createBudget(prisma, {
        name: "budget tranportasi", 
        budget: BigInt(1_500_000_0000),
    });
    await entry(prisma, { 
        creditId: budgetPeralatan.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(300_000_0000), 
        description: "beli sapu",
    });
    await entry(prisma, {
        creditId: budgetPeralatan.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(200_000_0000), 
        description: "beli pengki", 
    });
    await entry(prisma, {
        creditId: budgetMakan.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(300_000_0000), 
        description: "beli minum",
    });
    await entry(prisma, {
        creditId: budgetMakan.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(300_000_0000), 
        description: "beli makan pagi",
    });
    await entry(prisma, {
        creditId: budgetMakan.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(300_000_0000), 
        description: "beli makan malam",
    });
    await entry(prisma, {
        creditId: budgetMakan.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(300_000_0000), 
        description: "beli makan sore",
    });
    await entry(prisma, {
        creditId: budgetTransportasi.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(60_000_0000), 
        description: "naik gojek berangkat",
    });
    await entry(prisma, {
        creditId: budgetTransportasi.id, 
        debitId: expenseAccount.id, 
        amount: BigInt(60_000_0000), 
        description: "naik gojek pulang",
    });
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