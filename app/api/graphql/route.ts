import { ApolloServer } from "@apollo/server";
import { GraphQLScalarType, Kind } from "graphql";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers, GetBudgetInput } from "../../../lib/resolvers-types";
import { readFileSync } from 'fs';
import { PrismaClient, Account, AccountCode } from "@prisma/client";
import { 
    createBudget, 
    updateBudget, 
    deleteBudget, 
    deleteBudgetMany, 
    entry, 
    updateExpense,
} from "../../../lib/transactions";
import { DateTimeTypeDefinition, DateTimeResolver } from "graphql-scalars";
import createMessageBudgetDelete from "../../../lib/utils/createMessageBudgetDelete";
import expenseCode from "../../../lib/utils/expenseCode";
import accountCode from "../../../lib/utils/accountCode";

function splitCode(code: string) {
    return code.split("-").map(Number);
}

async function getBudgetDetail(
    dataSources: PrismaClient, 
    account: Account & { accountCode: AccountCode & { accountSupercode: AccountCode } }
) {
    const ledgerEntries = await dataSources.ledger.findMany({
        where: {
            entries: { some: { account: { id: account.id } } },
        },
        include: { 
            entries: { 
                include: { 
                    account: true 
                } 
            } 
        },
        orderBy: [
            { code: "desc" },
            { correctionOrder: "desc" },
        ],
    });

    const budget = ledgerEntries.reduce((acc, val) => {

        if (val.stateId !== 1) {
            return acc;
        }

        const entry = val.entries.filter((entry) => entry.direction === 1 && entry.account.id === account.id)[0];
        if (entry) {
            return acc + entry.amount;
        }

        return acc;
    }, BigInt(0));
    
    const expense = ledgerEntries.reduce((acc, val) => {
        if (val.stateId !== 1) {
            return acc;
        }

        const entry = val.entries.filter((entry) => entry.direction === -1 && entry.account.id === account.id)[0];
        if (entry) {
            return acc + entry.amount;
        }

        return acc;
    }, BigInt(0));
    
    const ledgerEntries_ = ledgerEntries.map((record) => {
        let entry = record.entries.filter((entry) => entry.account.id === account.id)[0];
        
        if (entry.direction === 1) {
            return {
                id: record.id,
                code: expenseCode.format(record.code),
                description: record.description,
                debit: entry.amount,
                balance: entry.balance,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            }
        }

        return {
            id: record.id,
            code: expenseCode.format(record.code),
            description: record.description,
            credit: entry.amount,
            balance: entry.balance,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        }
    });

    return {
        id: account.id,
        code: `${accountCode.format(account.accountCode.accountSupercode.code)}-${accountCode.format(account.accountCode.code)}`,
        name: account.name,
        budget: budget,
        expense: expense,
        balance: account.balance,
        ledgerEntries: ledgerEntries_,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
    }
}

async function fetchBugdets(dataSources: PrismaClient, input?: GetBudgetInput ) {    
    const data = await dataSources.account.findMany({ 
        where: { 
            accountCode: { accountSupercode: { code: 101 } },
            stateId: 1,
            createdAt: {
                lt: input?.createdBefore,
            },
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
                budget: BigInt(0),
                expense: BigInt(0),
                balance: BigInt(0)
            })
        },

        async budgets(_, { input }, context) {
            return await fetchBugdets(context.dataSources, input);
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
                where: { 
                    entries: { some: { account: { accountCode: { code: 200 } } } },
                    stateId: 1,
                },
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
                    code: expenseCode.format(record.code),
                    description: record.description,
                    budgetAccount: budgetAccount.name,
                    budgetAccountId: budgetAccount.id,
                    amount: expenseEntry.amount,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                };
            });
        },

        async expenseByCode(_, { code }, context) {
            const ledgerEntry = await context.dataSources.ledger.findFirst({ 
                where: { 
                    code: Number(code),
                    stateId: 1,
                },
                include: { entries: { include: { account: { include: { accountCode: { include: { accountSupercode: true } } } } } } },
            });

            if (!ledgerEntry) {
                return {
                    code: 404,
                    success: false,
                    message: `expense dengan code ${code} tidak ada`,
                }
            }

            const budgetAccount = ledgerEntry.entries.filter(entry => {
                const accountSupercode = entry.account.accountCode.accountSupercode;
                if (accountSupercode) return accountSupercode.code == 101;
                return false;
            })[0].account;

            const expenseEntry = ledgerEntry.entries.filter(entry => entry.account.accountCode.code == 200)[0];

            const expense = {
                id: ledgerEntry.id,
                code: expenseCode.format(ledgerEntry.code),
                description: ledgerEntry.description,
                budgetAccount: budgetAccount.name,
                budgetAccountId: budgetAccount.id,
                amount: expenseEntry.amount,
                createdAt: ledgerEntry.createdAt,
                updatedAt: ledgerEntry.updatedAt,
            };

            return {
                code: 200,
                success: true,
                message: "",
                expense,
            }
        }
    },

    Mutation: {
        async createBudget(_, { input }, context) {
            try {
                const account = await createBudget(context.dataSources, { 
                    name: input.name,
                    budget: input.budget,
                });
                
                return {
                    code: 200,
                    success: true,
                    message: `akun ${input.name} berhasil dibuat`,
                    budget: {
                        id: account.id,
                        code: `${accountCode.format(account.accountCode.code)}-${accountCode.format(account.accountCode.accountSupercode.code)}`,
                        name: account.name,
                        budget: account.balance,
                        expense: BigInt(0),
                        ledgerEntries: [],
                        balance: account.balance,
                        createdAt: account.createdAt,
                        updatedAt: account.updatedAt,
                    },
                };
            } catch (err) {
                return {
                    code: 500,
                    success: false,
                    message: `akun ${input.name} gagal dibuat`,
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
                }
            }
        },

        async deleteBudget(_, { input }, context) {
            try {
                const account = await deleteBudget(context.dataSources, { id: input.id });
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
                }
            }
        },

        async deleteBudgetMany(_, { input: { ids } }, context) {
            async function getBudgetDetailList(budgets) {
                return await Promise.all(budgets.map((budget) => getBudgetDetail(context.dataSources, budget)))
            }

            try {                
                const accounts = await deleteBudgetMany(context.dataSources, { ids });

                const budgets = await getBudgetDetailList(accounts);

                return {
                    code: 200,
                    success: true,
                    message: createMessageBudgetDelete(budgets, "", " berhasil dihapus"),
                    budgets: budgets,
                };
            } catch (error) {
                const accounts = context.dataSources.account.findMany({
                    where: {
                        id: {
                            in: ids
                        }
                    }
                });

                const budgets = await getBudgetDetailList(accounts);

                return {
                    code: 500,
                    success: false,
                    message: createMessageBudgetDelete(budgets, "", " gagal dihapus")
                }
            }
        },

        async createExpense(_, { input }, context) {
            try {
                const expenseAccount = await context.dataSources.account.findFirst({
                    where: { accountCode: { code: 200 } }
                });
                const budgetAccount = await context.dataSources.account.findUnique({
                    where: { id: input.budgetAccountId }
                });
                const ledger = await entry(context.dataSources, { 
                    creditId: budgetAccount.id, 
                    debitId: expenseAccount.id, 
                    amount: BigInt(input.amount) * BigInt(10000), 
                    description: input.description
                }); 
                return {
                    code: 200,
                    success: true,
                    message: `${input.description} berhasil ditambahkan`,
                    expense: {
                        id: ledger.id,
                        code: expenseCode.format(ledger.code),
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
                    message: `${input.description} gagal ditambahkan: ${error.message}`,
                }
            }
        },

        async updateExpense(_, { input: input_ }, context) {
            try {
                const input = { ...input_, ...{ amount: BigInt(input_.amount) * BigInt(10000), code: Number(input_.code) } };
                const ledgerEntry = await updateExpense(context.dataSources, input);
                const budgetAccount = ledgerEntry
                    .entries
                    .filter((entry) => entry.accountId === input.budgetAccountId)[0]
                    .account;

                return {
                    code: 200,
                    success: true,
                    message: `${input.description} berhasil diperbarui`,
                    expense: {
                        id: ledgerEntry.id,
                        code: expenseCode.format(ledgerEntry.code),
                        budgetAccountId: budgetAccount.id,
                        budgetAccount: budgetAccount.name,
                        amount: input.amount,
                        description: ledgerEntry.description,
                        createdAt: ledgerEntry.createdAt,
                        updatedAt: ledgerEntry.updatedAt,
                    },
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${input_.description} gagal diperbarui: ${error.message}`,
                }
            }
        }
    }
}

const MoneyResolver = new GraphQLScalarType({
    name: 'Money',
    description: 'Money custom scalar type',
    serialize(value) {
        if (typeof value === "bigint") {
            return Number(value / BigInt(10000));
        }
    
        throw Error('GraphQL Money Scalar serializer expected a `bigint`');
    },
    parseValue(value) {
        if (typeof value === 'number') {
            return BigInt(value) * BigInt(10000);
        }
    
        throw new Error('GraphQL Money Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return BigInt(parseInt(ast.value)) * BigInt(10000);
        }

        return null;
    },
  });

const typeDefs = readFileSync(process.cwd() + '/schema.graphql', 'utf8');

const server = new ApolloServer({ 
    resolvers: {
        DateTime: DateTimeResolver,
        Money: MoneyResolver,
        ...resolvers
    }, 
    typeDefs: [
        DateTimeTypeDefinition,
        typeDefs,
    ],
});

const handler = startServerAndCreateNextHandler(server, {
    context: async () => ({
        dataSources: new PrismaClient()
    })
});

export { handler as GET, handler as POST };