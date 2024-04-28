import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers } from "../../../lib/resolvers-types";
import { readFileSync } from 'fs';
import { PrismaClient } from "@prisma/client";
import { createBudget, entry } from "../../../lib/transactions";

const resolvers: Resolvers = {
    Query: {
        async budgets(_, __, context) {
            const data = await context.dataSources.account.findMany({ 
                where: { accountCode: { accountSupercode: { code: 101 } } },
                include: {
                    entries: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        
            return data.map((record) => {
                const budget = record.entries
                    .filter(val => val.direction == 1)
                    .reduce((acc, val) => acc + val.amount, BigInt(0));
                const expense = record.entries
                    .filter(val => val.direction == -1)
                    .reduce((acc, val) => acc + val.amount, BigInt(0));
                return {
                    id: record.id,
                    name: record.name,
                    budget: Number(budget / BigInt(10000)),
                    expense: Number(expense / BigInt(10000)),
                    balance: Number(record.balance / BigInt(10000)),
                    createdAt: record.createdAt.toISOString(),
                    updatedAt: record.updatedAt.toISOString(),
                }
            });
        },

        async expenses(_, __, context) {
            const data = await context.dataSources.ledger.findMany({ 
                where: { entries: { some: { account: { accountCode: { code: 200 } } } } },
                include: { entries: { include: { account: { include: { accountCode: { include: { accountSupercode: true } } } } } } },
                orderBy: {
                    createdAt: "desc",
                }
            });
        
            return data.map((record) => {
                const budgetAccount = record.entries.filter(entry => {
                    const accountSupercode = entry.account.accountCode.accountSupercode;
                    if (accountSupercode) return accountSupercode.code == 101;
                    return false;
                })[0].account;
                const expenseEntry = record.entries.filter(entry => entry.account.accountCode.code == 200)[0];
                return {
                    id: record.id,
                    description: record.description,
                    budgetAccount: budgetAccount.name,
                    budgetAccountId: budgetAccount.id,
                    amount: Number(expenseEntry.amount / BigInt(10000)),
                    createdAt: record.createdAt.toISOString(),
                    updatedAt: record.updatedAt.toISOString(),
                };
            });
        }
    },

    Mutation: {
        async createBudget(_, { input }, context) {
            try {
                const account = await createBudget(
                    context.dataSources, 
                    input.name,
                    BigInt(input.budget) * BigInt(10000),
                );
                return {
                    code: 200,
                    success: true,
                    message: `akun ${input.name} berhasil dibuat`,
                    budget: {
                        id: account.id,
                        name: account.name,
                        budget: Number(account.balance),
                        expense: 0,
                        balance: Number(account.balance),
                        createdAt: account.createdAt.toISOString(),
                        updatedAt: account.updatedAt.toISOString(),
                    },
                };
            } catch (err) {
                return {
                    code: 500,
                    success: false,
                    message: `akun ${input.name} gagal dibuat`,
                    budget: null,
                }
            }
        },

        async addExpense(_, { input }, context) {
            try {
                const expenseAccount = await context.dataSources.account.findFirst({
                    where: { accountCode: { code: 200 } }
                });
                const budgetAccount = await context.dataSources.account.findUnique({
                    where: { id: input.budgetAccountId }
                });
                const ledger = await entry(
                    context.dataSources, 
                    budgetAccount.id, 
                    expenseAccount.id, 
                    BigInt(input.amount) * BigInt(10000), 
                    input.description
                ); 
                return {
                    code: 200,
                    success: true,
                    message: `${input.description} berhasil ditambahkan`,
                    expense: {
                        id: ledger.id,
                        budgetAccountId: budgetAccount.id,
                        budgetAccount: budgetAccount.name,
                        amount: input.amount,
                        description: ledger.description,
                        createdAt: ledger.createdAt.toISOString(),
                        updatedAt: ledger.updatedAt.toISOString(),
                    },
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `akun ${input.description} gagal ditambahkan`,
                    expense: null,
                }
            }
        }
    }
}

const typeDefs = readFileSync(process.cwd() + '/schema.graphql', 'utf8');

const server = new ApolloServer({ resolvers, typeDefs });

const handler = startServerAndCreateNextHandler(server, {
    context: async () => ({
        dataSources: new PrismaClient()
    })
});

export { handler as GET, handler as POST };