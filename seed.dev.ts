import { PrismaClient } from '@prisma/client';
import { 
    createBudgetProcedure, 
    createExpenseProcedure, 
    journalizeProcedure,
} from "./lib/database/procedures";
import { 
    CASH_ACCOUNT_CODE, 
    EXPENSE_ACCOUNT_CODE, 
    BUDGET_ACCOUNT_CODE,
    PRIVE_ACCOUNT_CODE, 
} from './lib/database/account-code';
import {
    ASSET,
    EXPENSE,
    PRIVE,
} from "./lib/database/account-type";

const prisma = new PrismaClient();

async function main() {
    await prisma.$transaction(async (tx: PrismaClient) => {
        const assetAccountType = await tx.accountType.create({
            data: {
                id: ASSET,
                name: "asset",
                direction: 1,
            },
        });
    
        const expenseAccountType = await tx.accountType.create({
            data: {
                id: EXPENSE,
                name: "expense",
                direction: -1,
            },
        });
    
        const priveAccountType = await tx.accountType.create({
            data: {
                id: PRIVE,
                name: "prive",
                direction: -1,
            },
        });
    
        const cashAccountCode = await tx.accountCode.create({
            data: {
                code: CASH_ACCOUNT_CODE,
            }
        });
    
        const expenseAccountCode = await tx.accountCode.create({
            data: {
                code: EXPENSE_ACCOUNT_CODE,
            }
        });
    
        const budgetAccountCode = await tx.accountCode.create({
            data: {
                code: BUDGET_ACCOUNT_CODE,
            }
        });
    
        const priveAccountCode = await tx.accountCode.create({
            data: {
                code: PRIVE_ACCOUNT_CODE,
            }
        });
    
        const cashAccount = await tx.account.create({
            data: {
                name: "cash account",
                accountCode: { connect: { id: cashAccountCode.id } },
                accountType: { connect: { id: assetAccountType.id } },
            },
        });
    
        const priveAccount = await tx.account.create({
            data: {
                name: "prive account",
                accountCode: { connect: { id: priveAccountCode.id } },
                accountType: { connect: { id: priveAccountType.id } },
            },
        });
    
        const cashAccountLedger = await tx.ledger.create({
            data: {
                balance: BigInt(0),
                account: { connect: { id: cashAccount.id, } },
            },
        });
    
        const priveAccountLedger = await tx.ledger.create({
            data: {
                balance: BigInt(0),
                account: { connect: { id: priveAccount.id, } },
            },
        });
    
        await journalizeProcedure(tx, {
            debitAccountId: cashAccount.id,
            creditAccountId: priveAccount.id,
            amount: BigInt(1_000_000_000_0000),
            description: "modal awal",
        });
    
        const budgetPeralatan = await createBudgetProcedure(tx, { 
            name: "budget peralatan", 
            amount: BigInt(2_000_000_0000),
        });
    
        const budgetMakan = await createBudgetProcedure(tx, {
            name: "budget makan", 
            amount: BigInt(2_000_000_0000),
        });
    
        const budgetTransportasi = await createBudgetProcedure(tx, {
            name: "budget tranportasi", 
            amount: BigInt(1_500_000_0000),
        });
    
        await createExpenseProcedure(tx, { 
            budgetId: budgetPeralatan.id, 
            amount: BigInt(300_000_0000), 
            description: "beli sapu",
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetPeralatan.id, 
            amount: BigInt(200_000_0000), 
            description: "beli pengki", 
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetMakan.id, 
            amount: BigInt(300_000_0000), 
            description: "beli minum",
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetMakan.id,
            amount: BigInt(300_000_0000), 
            description: "beli makan pagi",
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetMakan.id, 
            amount: BigInt(300_000_0000), 
            description: "beli makan malam",
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetMakan.id, 
            amount: BigInt(300_000_0000), 
            description: "beli makan sore",
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetTransportasi.id,
            amount: BigInt(60_000_0000), 
            description: "naik gojek berangkat",
        });
        await createExpenseProcedure(tx, {
            budgetId: budgetTransportasi.id,
            amount: BigInt(60_000_0000), 
            description: "naik gojek pulang",
        });
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