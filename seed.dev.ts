import { PrismaClient } from '@prisma/client';
import { entry } from "./lib/transaction";

const prisma = new PrismaClient();

const CASH_ACCOUNT_CODE = 100;
const EXPENSE_ACCOUNT_CODE = 200;
const BUDGET_ACCOUNT_CODE = 101;
const CASH_ACCOUNT_ID = 1;
const EXPENSE_ACCOUNT_ID = 2;
const BUDGET_PERALATAN_ID = 3;
const BUDGET_MAKAN_ID = 4;
const BUDGET_TRANSPORTASI_ID = 5;

async function main() {
    await prisma.account.createMany({
        data: [
            {
                id: CASH_ACCOUNT_ID,
                code: CASH_ACCOUNT_CODE,
                name: "cash",
                type: "asset",
                balance: 1_000_000_000_0000
            },
            {
                id: EXPENSE_ACCOUNT_ID,
                code: EXPENSE_ACCOUNT_CODE,
                name: "expense",
                type: "expense",
                balance: 0,
            },
            {
                id: BUDGET_PERALATAN_ID,
                code: BUDGET_ACCOUNT_CODE,
                name: "Budget Peralatan",
                type: "asset",
                balance: 0,
            },
            {
                id: BUDGET_MAKAN_ID,
                code: BUDGET_ACCOUNT_CODE,
                name: "Budget Makan",
                type: "asset",
                balance: 0,
            },
            {
                id: BUDGET_TRANSPORTASI_ID,
                code: BUDGET_ACCOUNT_CODE,
                name: "Budget Transportasi",
                type: "asset",
                balance: 0,
            },
        ],
    });

    await entry(prisma, CASH_ACCOUNT_ID, BUDGET_PERALATAN_ID, BigInt(2_000_000_0000), "tambah saldo budget peralatan");
    await entry(prisma, CASH_ACCOUNT_ID, BUDGET_MAKAN_ID, BigInt(2_000_000_0000), "tambah saldo budget makan");
    await entry(prisma, CASH_ACCOUNT_ID, BUDGET_TRANSPORTASI_ID, BigInt(1_500_000_0000), "tambah saldo budget transportasi");
    await entry(prisma, BUDGET_PERALATAN_ID, EXPENSE_ACCOUNT_ID, BigInt(300_000_0000), "beli sapu");
    await entry(prisma, BUDGET_PERALATAN_ID, EXPENSE_ACCOUNT_ID, BigInt(200_000_0000), "beli pengki");
    await entry(prisma, BUDGET_MAKAN_ID, EXPENSE_ACCOUNT_ID, BigInt(300_000_0000), "beli minum");
    await entry(prisma, BUDGET_MAKAN_ID, EXPENSE_ACCOUNT_ID, BigInt(300_000_0000), "beli makan pagi");
    await entry(prisma, BUDGET_MAKAN_ID, EXPENSE_ACCOUNT_ID, BigInt(300_000_0000), "beli makan malam");
    await entry(prisma, BUDGET_MAKAN_ID, EXPENSE_ACCOUNT_ID, BigInt(300_000_0000), "beli makan sore");
    await entry(prisma, BUDGET_TRANSPORTASI_ID, EXPENSE_ACCOUNT_ID, BigInt(60_000_0000), "naik gojek berangkat");
    await entry(prisma, BUDGET_TRANSPORTASI_ID, EXPENSE_ACCOUNT_ID, BigInt(60_000_0000), "naik gojek pulang");
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