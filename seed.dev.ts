import { PrismaClient } from '@prisma/client';
import { 
    createBudgetProcedure, 
    createExpenseProcedure, 
    journalizeProcedure,
    createAccountProcedure,
} from "./lib/database/procedures";
import { 
    CASH_ACCOUNT_CODE, 
    BUDGET_EXPENSE_ACCOUNT_CODE, 
    BUDGET_CASH_ACCOUNT_CODE,
    OWNER_CAPITAL_ACCOUNT_CODE, 
} from './lib/database/account-code';
import {
    ASSET,
    EXPENSE,
    EQUITY,
} from "./lib/database/account-type";
import { 
    BUDGET_FUNDING,
    BUDGET_EXPENSE,
} from './lib/database/budget-transacton-type';

const prisma = new PrismaClient();

async function main() {
    await prisma.$transaction(async (tx: PrismaClient) => {
        await tx.accountType.create({
            data: {
                name: ASSET,
                direction: 1,
                ledgerDirection: 1,
            },
        });
    
        await tx.accountType.create({
            data: {
                name: EXPENSE,
                direction: -1,
                ledgerDirection: 1,
            },
        });
    
        await tx.accountType.create({
            data: {
                name: EQUITY,
                direction: 1,
                ledgerDirection: -1,
            },
        });
    
        await tx.accountCode.create({
            data: {
                code: BUDGET_EXPENSE_ACCOUNT_CODE,
            }
        });
    
        await tx.accountCode.create({
            data: {
                code: BUDGET_CASH_ACCOUNT_CODE,
            }
        });

        await tx.budgetTransactionType.create({
            data: {
                name: BUDGET_FUNDING,
            },
        });

        await tx.budgetTransactionType.create({
            data: {
                name: BUDGET_EXPENSE,
            },
        });
    
        createAccountProcedure(tx, {
            name: "modal pemilik",
            accountCode: { code: OWNER_CAPITAL_ACCOUNT_CODE },
            accountType: EQUITY,
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