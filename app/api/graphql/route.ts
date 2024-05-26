import { ApolloServer } from "@apollo/server";
import { GraphQLScalarType, Kind } from "graphql";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers, GetBudgetInput } from "../../../lib/graphql/resolvers-types";
import { readFileSync } from 'fs';
import { 
    PrismaClient, 
    Budget, 
    Account, 
    AccountCode,
} from "@prisma/client";
import { 
    createBudget, 
    updateBudget, 
    deleteBudget, 
    deleteBudgetMany, 
    createExpense,
    updateExpense,
} from "../../../lib/database/transactions";
import { DateTimeTypeDefinition, DateTimeResolver } from "graphql-scalars";
import createMessageDeleteBudget from "../../../lib/utils/createMessageDeleteBudget";
import expenseID from "../../../lib/utils/expenseID";
import accountCode from "../../../lib/utils/accountCode";
import { BUDGET_CASH_ACCOUNT_CODE } from "../../../lib/database/account-code";
import { BUDGET_CASH, BUDGET_EXPENSE } from "../../../lib/database/budget-account-assignment";

function getAccountCode(code: string) {
    return code.split("-").map(Number);
}

function getBudgetCode(account: Account & { accountCode: AccountCode & { accountSupercode: AccountCode } }) {
    const supercode = account.accountCode.accountSupercode.code;
    const subcode = account.accountCode.code;
    return `${supercode}-${accountCode.format(subcode)}`;
}

async function getBudgetDetail(
    dataSources: PrismaClient, 
    budget: Budget,
) {
    const budgetAccounts = await dataSources.budgetAccount.findMany({
        where: {
            budget: { id: budget.id },
        },
    });

    const budgetCashAccountId = budgetAccounts.filter(
        (budgetAccount) => budgetAccount.task === BUDGET_CASH,
    )[0]["id"];
    const budgetExpenseAccountId = budgetAccounts.filter(
        (budgetAccount) => budgetAccount.task === BUDGET_EXPENSE,
    )[0]["id"];

    const budgetCashAccount = await dataSources.account.findUnique({
        where: {
            id: budgetCashAccountId,
        },
        include: {
            ledgers: {
                where: {
                    open: true,
                },
                include: {
                    entries: {
                        include: {
                            journal: true,
                        },
                    },
                },
            },
            accountCode: {
                include: {
                    accountSupercode: true,
                },
            },
        },
    });

    const budgetExpenseAccount = await dataSources.account.findUnique({
        where: {
            id: budgetExpenseAccountId,
        },
        include: {
            ledgers: {
                where: {
                    open: true,
                },
                include: {
                    entries: true,
                },
            },
        },
    });

    const openBudgetCashLedger = budgetCashAccount.ledgers[0];
    const openBudgetExpenseLedger = budgetExpenseAccount.ledgers[0];

    const budgetTotal = openBudgetCashLedger.entries.reduce((acc, entry) => {
        if (entry.direction === 1) {
            return acc + entry.amount;
        }

        return acc;
    }, BigInt(0));
    
    const expenseTotal = openBudgetExpenseLedger.balance;
    
    const ledgerEntries = openBudgetCashLedger.entries.map((entry) => {
        const entry_ = {
            id: entry.journal.id,
            description: entry.journal.description,
            balance: entry.balance,
            createdAt: entry.journal.createdAt,
        };

        if (entry.direction === 1) {
            return {
                ...entry_,
                ...{ debit: entry.amount },
            }
        }

        return {
            ...entry_,
            ...{ credit: entry.amount },
        }
    });

    return {
        code: getBudgetCode(budgetCashAccount),
        name: budget.name,
        amount: budgetTotal,
        expense: expenseTotal,
        balance: openBudgetCashLedger.balance,
        ledgerEntries,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
    }
}

async function fetchBudgetByCode(dataSources: PrismaClient, code: string) {
    const budgetCode = getAccountCode(code);
    return await dataSources.budget.findFirst({
        where: {
            active: true,
            budgetAccounts: {
                some: {
                    account: {
                        accountCode: {
                            code: budgetCode[1],
                            accountSupercode: {
                                code: budgetCode[0],
                            },
                        },
                    },
                },
            },
        },
    });
} 

async function fetchBudgetsByCodes(dataSources: PrismaClient, codes: string[]) {
    return await Promise.all(codes.map(
        async (code) => await fetchBudgetByCode(dataSources, code)
    ));
}

async function fetchBudgets(dataSources: PrismaClient, input?: GetBudgetInput ) {    
    const budgets = await dataSources.budget.findMany({ 
        where: {
            active: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return await Promise.all(budgets.map(async (budget) => await getBudgetDetail(dataSources, budget)));
};

const resolvers: Resolvers = {
    Query: {
        async excerptReport(_, __, context) {
            const budgets = await fetchBudgets(context.dataSources);

            return budgets.reduce((acc, budget) => {
                return {
                    budget: acc.budget + budget.amount,
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
            return await fetchBudgets(context.dataSources, input);
        },

        async budgetByCode(_, { code }, context) {
            const budget = await fetchBudgetByCode(context.dataSources, code);

            if (!budget) {
                return {
                    code: 404,
                    success: false,
                    message: `account budget dengan code ${code} tidak ada`,
                }
            }

            const budgetDetail = await getBudgetDetail(context.dataSources, budget);

            return {
                code: 200,
                success: true,
                message: "",
                budget: budgetDetail,
            }
        },

        async expenses(_, __, context) {
            const budgets = await context.dataSources.budget.findMany({
                orderBy: {
                    id: "desc",
                },
                include: {
                    budgetAccounts: {
                        include: {
                            account: {
                                include: {
                                    accountCode: {
                                        include: {
                                            accountSupercode: true,
                                        },
                                    },
                                    ledgers: {
                                        include: {
                                            entries: {
                                                include: {
                                                    journal: true,
                                                },
                                            },
                                        },
                                        where: {
                                            open: true,
                                        },
                                    },
                                },
                            },
                        },
                        where: {
                            task: BUDGET_EXPENSE,
                        },
                    },
                },
            });

            return budgets.map(
                (budget) => ({ 
                    name: budget.name,
                    cashAccount: budget.budgetAccounts[0].account,
                    entries: budget.budgetAccounts[0].account.ledgers[0].entries,
                })
            )
            .flatMap(
                (budget) => budget.entries.map((entry) => ({
                    id: expenseID.format(entry.journal.id),
                    description: entry.journal.description,
                    budgetCode: getBudgetCode(budget.cashAccount),
                    budgetName: budget.name,
                    amount: entry.amount,
                    createdAt: entry.journal.createdAt,
                }))
            );
        },

        async expenseById(_, { id }, context) {
            const journal = await context.dataSources.journal.findUnique({ 
                where: { 
                    id: parseInt(id),
                    active: true,
                },
                include: {
                    entries: {
                        include: {
                            ledger: {
                                include: {
                                    account: {
                                        include: {
                                            accountCode: {
                                                include: {
                                                    accountSupercode: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        where: {
                            ledger: {
                                account: {
                                    accountCode: {
                                        accountSupercode: {
                                            code: BUDGET_CASH_ACCOUNT_CODE,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!journal) {
                return {
                    code: 404,
                    success: false,
                    message: `expense dengan code ${id} tidak ada`,
                }
            }

            const expense = {
                id: expenseID.format(journal.id),
                description: journal.description,
                budgetCode: getBudgetCode(journal.entries[0].ledger.account),
                budgetName: journal.entries[0].ledger.account.name,
                amount: journal.entries[0].amount,
                createdAt: journal.createdAt,
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
                const budget = await createBudget(context.dataSources, { 
                    name: input.name,
                    amount: input.amount,
                });

                const budgetCashAccount = await context.dataSources.account.findFirst({
                    where: {
                        budgetAccount: {
                            budget: {
                                id: budget.id,
                            },
                        },
                    },
                    include: {
                        accountCode: {
                            include: {
                                accountSupercode: true,
                            },
                        },
                        ledgers: {
                            where: {
                                open: true,
                            },
                        },
                    },
                });
                
                return {
                    code: 200,
                    success: true,
                    message: `akun ${input.name} berhasil dibuat`,
                    budget: {
                        code: getBudgetCode(budgetCashAccount),
                        name: budget.name,
                        amount: budgetCashAccount.ledgers[0].balance,
                        expense: BigInt(0),
                        ledgerEntries: [],
                        balance: budgetCashAccount.ledgers[0].balance,
                        createdAt: budget.createdAt,
                        updatedAt: budget.updatedAt,
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
                const budget = await fetchBudgetByCode(context.dataSources, input.code);

                await updateBudget(context.dataSources, {
                    id: budget.id,
                    name: input.name,
                    amount: input.amount,
                });

                const budgetDetail = await getBudgetDetail(context.dataSources, budget);
                
                return {
                    code: 200,
                    success: true,
                    message: `${input.name} berhasil diperbarui`,
                    budget: budgetDetail,
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${input.name} gagal diperbarui: ${error.message}`,
                }
            }
        },

        async deleteBudget(_, { input }, context) {
            const budget = await fetchBudgetByCode(context.dataSources, input.code);

            try {
                await deleteBudget(context.dataSources, { id: budget.id });
                const budgetDetail = await getBudgetDetail(context.dataSources, budget);
                return {
                    code: 200,
                    success: true,
                    message: `${budgetDetail.name} berhasil dihapus`,
                    budget: budgetDetail,
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${budget.name} gagal dihapus`,
                }
            }
        },

        async deleteBudgetMany(_, { input: { codes } }, context) {
            const budgets = await fetchBudgetsByCodes(context.dataSources, codes);
            const budgetNames = budgets.map((budget) => budget.name);
            const budgetDetailList = await Promise.all(budgets.map(
                async (budget) => await getBudgetDetail(context.dataSources, budget)
            ));
            const budgetIds = budgets.map((budget) => budget.id);

            try {                
                await deleteBudgetMany(context.dataSources, { ids: budgetIds });

                return {
                    code: 200,
                    success: true,
                    message: createMessageDeleteBudget(budgetNames, "", " berhasil dihapus"),
                    budgets: budgetDetailList,
                };
            } catch (error) {
                const accounts = context.dataSources.account.findMany({
                    where: {
                        id: {
                            in: budgetIds
                        }
                    }
                });

                return {
                    code: 500,
                    success: false,
                    message: createMessageDeleteBudget(budgetNames, "", " gagal dihapus")
                }
            }
        },

        async createExpense(_, { input }, context) {
            try {
                const budget = await fetchBudgetByCode(context.dataSources, input.budgetCode);

                const journal = await createExpense(context.dataSources, { 
                    ...input,
                    ...{ budgetId: budget.id },
                });

                const budgetCashAccountJournalEntry = await context.dataSources.entry.findFirst({
                    where: {
                        journal: { id: journal.id },
                        ledger: {
                            account: {
                                accountCode: {
                                    accountSupercode: {
                                        code: BUDGET_CASH_ACCOUNT_CODE,
                                    },
                                },
                            },
                        },
                    },
                    include: {
                        ledger: {
                            include: {
                                account: {
                                    include: {
                                        accountCode: {
                                            include: {
                                                accountSupercode: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                const budgetCashAccount = budgetCashAccountJournalEntry.ledger.account;

                return {
                    code: 200,
                    success: true,
                    message: `${journal.description} berhasil ditambahkan`,
                    expense: {
                        id: expenseID.format(journal.id),
                        budgetCode: getBudgetCode(budgetCashAccount),
                        budgetName: budget.name,
                        amount: input.amount,
                        description: journal.description,
                        createdAt: journal.createdAt,
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
                const input = { ...input_, ...{ code: parseInt(input_.id) } };
                const journal = await updateExpense(context.dataSources, input);
                const budget = await fetchBudgetByCode(context.dataSources, input.budgetCode);

                return {
                    code: 200,
                    success: true,
                    message: `${input.description} berhasil diperbarui`,
                    expense: {
                        id: expenseID.format(journal.id),
                        budgetCode: input.budgetCode,
                        budgetName: budget.name,
                        amount: input.amount,
                        description: journal.description,
                        createdAt: journal.createdAt,
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