import { PrismaClient } from '@prisma/client';
import { createBudget, createExpense } from "./lib/database/transactions";
import { 
    CASH_ACCOUNT_CODE, 
    EXPENSE_ACCOUNT_CODE, 
    BUDGET_ACCOUNT_CODE 
} from './lib/database/account-code';
import { 
    ACTIVE,
    HIDE,
    ACCOUNT_SOFT_DELETED,
    LEDGER_SOFT_DELETED,
} from './lib/database/state';

const prisma = new PrismaClient();

async function main() {
    await prisma.state.createMany({
        data: [
            {
                id: ACTIVE,
                name: "active",
            },
            {
                id: HIDE,
                name: "hide",
            },
            {
                id: ACCOUNT_SOFT_DELETED,
                name: "account_soft_deleted",
            },
            { 
                id: LEDGER_SOFT_DELETED,
                name: "ledger_soft_deleted",
            },
        ],
    });
    await prisma.accountCode.createMany({
        data: [
            {
                code: CASH_ACCOUNT_CODE,
                accountType: "assets",
            },
            {
                code: EXPENSE_ACCOUNT_CODE,
                accountType: "expenses",
            },
            {
                code: BUDGET_ACCOUNT_CODE,
                accountType: "assets",
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
        amount: BigInt(2_000_000_0000),
    });
    const budgetMakan = await createBudget(prisma, {
        name: "budget makan", 
        amount: BigInt(2_000_000_0000),
    });
    const budgetTransportasi = await createBudget(prisma, {
        name: "budget tranportasi", 
        amount: BigInt(1_500_000_0000),
    });
    await createExpense(prisma, { 
        budgetAccountId: budgetPeralatan.id, 
        amount: BigInt(300_000_0000), 
        description: "beli sapu",
    });
    await createExpense(prisma, {
        budgetAccountId: budgetPeralatan.id, 
        amount: BigInt(200_000_0000), 
        description: "beli pengki", 
    });
    await createExpense(prisma, {
        budgetAccountId: budgetMakan.id, 
        amount: BigInt(300_000_0000), 
        description: "beli minum",
    });
    await createExpense(prisma, {
        budgetAccountId: budgetMakan.id,
        amount: BigInt(300_000_0000), 
        description: "beli makan pagi",
    });
    await createExpense(prisma, {
        budgetAccountId: budgetMakan.id, 
        amount: BigInt(300_000_0000), 
        description: "beli makan malam",
    });
    await createExpense(prisma, {
        budgetAccountId: budgetMakan.id, 
        amount: BigInt(300_000_0000), 
        description: "beli makan sore",
    });
    await createExpense(prisma, {
        budgetAccountId: budgetTransportasi.id,
        amount: BigInt(60_000_0000), 
        description: "naik gojek berangkat",
    });
    await createExpense(prisma, {
        budgetAccountId: budgetTransportasi.id,
        amount: BigInt(60_000_0000), 
        description: "naik gojek pulang",
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.log(e);
        await prisma.$disconnect()
        process.exit(1)
    })