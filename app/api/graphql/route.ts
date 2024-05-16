import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers } from "../../../lib/resolvers-types";
import { readFileSync } from 'fs';
import { PrismaClient, Account, AccountCode } from "@prisma/client";
import { createBudget, updateBudget, deleteBudget, entry } from "../../../lib/transactions";
import { DateTimeISOTypeDefinition, DateTimeISOResolver } from "graphql-scalars";

function splitCode(code: string) {
    return code.split("-").map(Number);
}

async function getBudgetDetail(
    dataSources: PrismaClient, 
    account: Account & { accountCode: AccountCode & { accountSupercode: AccountCode } }
) {
    const ledger = await dataSources.ledger.findMany({
        where: {
            entries: { some: { account: { id: account.id } } },
            stateId: 1,
        },
        include: { 
            entries: { 
                include: { 
                    account: true 
                } 
            } 
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const budget = ledger.reduce((acc, val) => {
        const entry = val.entries.filter((entry) => entry.direction === 1 && entry.account.id === account.id)[0];
        if (entry) {
            return acc + entry.amount;
        }
        return acc;
    }, BigInt(0));
    
    const expense = ledger.reduce((acc, val) => {
        const entry = val.entries.filter((entry) => entry.direction === -1 && entry.account.id === account.id)[0];
        if (entry) {
            return acc + entry.amount;
        }
        return acc;
    }, BigInt(0));
    
    const expenseDetail = ledger.map((record) => record.entries.reduce((acc, entry) => {
        if (entry.account.id === account.id) {
            if (entry.direction === 1) {
                return {
                    description: record.description,
                    debit: Number(entry.amount / BigInt(10000)),
                    balance: Number(entry.balance / BigInt(10000)),
                }
            } else {
                return {
                    description: record.description,
                    credit: Number(entry.amount / BigInt(10000)),
                    balance: Number(entry.balance / BigInt(10000)),
                }
            }
        }

        return acc;
    }, {
        description: "",
        balance: 0,
    }));

    return {
        id: account.id,
        code: `${account.accountCode.accountSupercode.code}-${account.accountCode.code}`,
        name: account.name,
        budget: Number(budget / BigInt(10000)),
        expense: Number(expense / BigInt(10000)),
        balance: Number(account.balance / BigInt(10000)),
        expenseDetail,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
    }
}

async function fetchBugdets(dataSources: PrismaClient) {
    const data = await dataSources.account.findMany({ 
        where: { 
            accountCode: { accountSupercode: { code: 101 } },
            stateId: 1,
        },
        include: {
            accountCode: {
                include: {
                    accountSupercode: true
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return await Promise.all(data.map(async (account) => await getBudgetDetail(dataSources, account)));
};

const resolvers: Resolvers = {
    Query: {
        async excerptReport(_, __, context) {
            const budgets = await fetchBugdets(context.dataSources);

            return budgets.reduce((acc, budget) => {
                return {
                    budget: acc.budget + budget.budget,
                    expense: acc.expense + budget.expense,
                    balance: acc.balance + budget.balance,
                }
            }, {
                budget: 0,
                expense: 0,
                balance: 0
            })
        },

        async budgets(_, __, context) {
            return await fetchBugdets(context.dataSources);
        },

        async budgetByCode(_, { code: code_ }, context) {
            const code = splitCode(code_);
            const account = await context.dataSources.account.findFirst({
                where: {
                    accountCode: { 
                        code: code[1], 
                        accountSupercode: { code: code[0] },
                    },
                    stateId: 1,
                },
                include: {
                    accountCode: {
                        include: {
                            accountSupercode: true
                        }
                    }
                }
            });

            if (!account) {
                return {
                    code: 404,
                    success: false,
                    message: `account budget dengan code ${code_} tidak ada`,
                }
            }

            const budget = await getBudgetDetail(context.dataSources, account);

            return {
                code: 200,
                success: true,
                message: "",
                budget,
            }
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
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
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
                        code: `${account.accountCode.code}-${account.accountCode.accountSupercode.code}`,
                        name: account.name,
                        budget: Number(account.balance),
                        expense: 0,
                        expenseDetail: [],
                        balance: Number(account.balance),
                        createdAt: account.createdAt,
                        updatedAt: account.updatedAt,
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

        async updateBudget(_, { input }, context) {
            try {
                const data = {
                    code: splitCode(input.code),
                    name: input.name,
                    balance: BigInt(input.balance) * BigInt(10000),
                };
                const account = await updateBudget(context.dataSources, data);
                const budget = await getBudgetDetail(context.dataSources, account);
                return {
                    code: 200,
                    success: true,
                    message: `${input.name} berhasil diperbarui`,
                    budget,
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${input.name} gagal diperbarui`,
                    expense: null,
                }
            }
        },

        async deleteBudget(_, { input }, context) {
            try {
                const account = await deleteBudget(context.dataSources, input.id);
                const budget = await getBudgetDetail(context.dataSources, account);
                return {
                    code: 200,
                    success: true,
                    message: `${account.name} berhasil dihapus`,
                    budget,
                };
            } catch (error) {
                const account = await context.dataSources.account.findUnique({
                    where: {
                        id: input.id,
                    }
                });
                return {
                    code: 500,
                    success: false,
                    message: `${account.name} gagal dihapus`,
                    expense: null,
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
                        createdAt: ledger.createdAt,
                        updatedAt: ledger.updatedAt,
                    },
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${input.description} gagal ditambahkan`,
                    expense: null,
                }
            }
        }
    }
}

const typeDefs = readFileSync(process.cwd() + '/schema.graphql', 'utf8');

const server = new ApolloServer({ 
    resolvers: {
        DateTimeISO: DateTimeISOResolver,
        ...resolvers
    }, 
    typeDefs: [
        DateTimeISOTypeDefinition,
        typeDefs,
    ],
});

const handler = startServerAndCreateNextHandler(server, {
    context: async () => ({
        dataSources: new PrismaClient()
    })
});

export { handler as GET, handler as POST };