import { ApolloServer } from "@apollo/server";
import { GraphQLScalarType, Kind } from "graphql";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers, GetBudgetInput } from "../../../lib/graphql/resolvers-types";
import { readFileSync } from 'fs';
import { 
    PrismaClient, 
    Budget, 
} from "@prisma/client";
import { 
    createBudget, 
    updateBudget, 
    deleteBudget, 
    deleteBudgetMany, 
    createExpense,
    updateExpense,
    deleteExpense,
    deleteExpenseMany,
} from "../../../lib/database/transactions";
import { 
    DateTimeTypeDefinition, 
    DateTimeResolver,
} from "graphql-scalars";
import createMessageDeleteMany from "../../../lib/utils/createMessageDeleteMany";
import expenseID from "../../../lib/utils/expenseID";
import * as accountCode from "../../../lib/utils/accountCode";
import { 
    BUDGET_CASH_ACCOUNT_CODE,
    BUDGET_EXPENSE_ACCOUNT_CODE, 
} from "../../../lib/database/account-code";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT,
} from "../../../lib/database/budget-account-task";
import { 
    BUDGET_FUNDING,
    BUDGET_EXPENSE,
} from "../../../lib/database/budget-transaction-type";

async function getBudgetDetail(
    dataSources: PrismaClient, 
    budget: Budget,
) {
    const rawBudgetTransactions = (await dataSources.budgetTransaction.findMany({
        where: {
            budget: { id: budget.id },
            softDeleted: false,
        },
        include: {
            journal: {
                include: {
                    entries: {
                        where: {
                            ledger: {
                                account: {
                                    accountCode: {
                                        parent: {
                                            code: BUDGET_CASH_ACCOUNT_CODE,
                                        }
                                    },
                                },
                            },
                        },
                    },
                },
            },
            transactionType: true,
        },
    }));

    const budgetTransactions = rawBudgetTransactions.map((budgetTransaction) => ({
        id: budgetTransaction.id,
        description: budgetTransaction.description,
        expense: budgetTransaction.transactionType.name === BUDGET_EXPENSE
            ? budgetTransaction.journal.entries[0].amount
            : null,
        balance: budgetTransaction.journal.entries[0].balance,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
    }));

    const accountAssignments = await dataSources.budgetAccountAssignment.findMany({
        where: {
            budget: { id: budget.id }
        },
        include: {
            account: {
                include: {
                    ledgers: {
                        where: {
                            open: true,
                            softDeleted: false,
                        },
                    },
                    accountCode: {
                        include: {
                            parent: true,
                        },
                    },
                },
            },
            task: true
        },
    });

    const budgetAmount = rawBudgetTransactions.filter(
        (rawBudgetTransaction) => rawBudgetTransaction.transactionType.name === BUDGET_FUNDING
    )[0]["journal"]["entries"][0]["amount"];

    const budgetCashAccount = accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];

    const budgetExpenseAccount = accountAssignments.filter(
        (accountAssignment) => accountAssignment.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0]["account"];

    return {
        code: budget.code,
        name: budget.name,
        amount: budgetAmount,
        expense: budgetExpenseAccount.ledgers[0].balance,
        balance: budgetCashAccount.ledgers[0].balance,
        transactions: budgetTransactions,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
    }
}

async function fetchBudgetByCode(dataSources: PrismaClient, code: string) {
    const budgetCode = accountCode.split(code);
    return await dataSources.budget.findFirst({
        where: {
            code,
            active: true,
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

async function fetchExpenses(dataSources: PrismaClient) {
    const budgetTransactions = await dataSources.budgetTransaction.findMany({
        include: {
            journal: {
                include: {
                    entries: {
                        where: {
                            ledger: {
                                account: {
                                    accountCode: {
                                        parent: {
                                            code: BUDGET_CASH_ACCOUNT_CODE,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            budget: true,
        },
        where: {
            transactionType: {
                name: BUDGET_EXPENSE,
            },
            softDeleted: false,
        },
        orderBy: {
            id: "desc",
        },
    });

    return budgetTransactions.map(
        (budgetTransaction) => ({ 
            id: expenseID.format(budgetTransaction.id),
            description: budgetTransaction.description,
            budgetCode: budgetTransaction.budget.code,
            budgetName: budgetTransaction.budget.name,
            amount: budgetTransaction.journal.entries[0].amount,
            createdAt: budgetTransaction.createdAt,
            updatedAt: budgetTransaction.updatedAt
        })
    )
}

async function fetchExpenseById(dataSources: PrismaClient, id: string) {
    const budgetTransaction = await dataSources.budgetTransaction.findUnique({
        where: {
            id: parseInt(id),
            softDeleted: false,
        },
        include: {
            journal: {
                include: {
                    entries: {
                        include: {
                            ledger: {
                                include: {
                                    account: {
                                        include: {
                                            accountCode: {
                                                include: {
                                                    parent: true,
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
                                        parent: {
                                            code: BUDGET_EXPENSE_ACCOUNT_CODE,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            budget: true,
        },
    });

    return {
        id: expenseID.format(budgetTransaction.id),
        description: budgetTransaction.description,
        budgetCode: budgetTransaction.budget.code,
        budgetName: budgetTransaction.budget.name,
        amount: budgetTransaction.journal.entries[0].amount,
        createdAt: budgetTransaction.createdAt,
        updatedAt: budgetTransaction.updatedAt,
    };
}

async function fetchExpensesByIds(dataSources: PrismaClient, { ids }: { ids: string[]; }) {
    return await Promise.all(ids.map(
        async (id) => await fetchExpenseById(dataSources, id)
    ));
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
            return fetchExpenses(context.dataSources);
        },

        async expenseById(_, { id }, context) {
            const expense = await fetchExpenseById(context.dataSources, id);

            if (!expense) {
                return {
                    code: 404,
                    success: false,
                    message: `expense dengan id ${id} tidak ada`,
                }
            }

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
                        budgetAccountAssignment: {
                            budget: {
                                id: budget.id,
                            },
                        },
                    },
                    include: {
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
                        code: budget.code,
                        name: budget.name,
                        amount: budgetCashAccount.ledgers[0].balance,
                        expense: BigInt(0),
                        transactions: [],
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
                    message: `${input.name} gagal diperbarui`,
                }
            }
        },

        async deleteBudget(_, { input }, context) {
            const budget = await fetchBudgetByCode(context.dataSources, input.code);

            try {
                const budgetDetail = await getBudgetDetail(context.dataSources, budget);
                await deleteBudget(context.dataSources, { id: budget.id });
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
                    message: createMessageDeleteMany(budgetNames, "", " berhasil dihapus"),
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
                    message: createMessageDeleteMany(budgetNames, "", ` gagal dihapus`)
                }
            }
        },

        async createExpense(_, { input }, context) {
            try {
                const budget = await fetchBudgetByCode(context.dataSources, input.budgetCode);

                const expense = await createExpense(context.dataSources, { 
                    ...input,
                    ...{ budgetId: budget.id },
                });

                

                return {
                    code: 200,
                    success: true,
                    message: `${expense.description} berhasil ditambahkan`,
                    expense: {
                        id: expenseID.format(expense.id),
                        budgetCode: budget.code,
                        budgetName: budget.name,
                        amount: input.amount,
                        description: expense.description,
                        createdAt: expense.createdAt,
                        updatedAt: expense.updatedAt
                    },
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${input.description} gagal ditambahkan`,
                }
            }
        },

        async updateExpense(_, { input }, context) {
            try {
                const budget = await fetchBudgetByCode(context.dataSources, input.budgetCode);

                const expense = await updateExpense(context.dataSources, input);

                return {
                    code: 200,
                    success: true,
                    message: `${input.description} berhasil diperbarui`,
                    expense: {
                        id: expenseID.format(expense.id),
                        budgetCode: input.budgetCode,
                        budgetName: budget.name,
                        amount: input.amount,
                        description: expense.description,
                        createdAt: expense.createdAt,
                        updatedAt: expense.updatedAt
                    },
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${input.description} gagal diperbarui`,
                }
            }
        },

        async deleteExpense(_, { input }, context) {
            const expense = await fetchExpenseById(context.dataSources, input.id);

            try {
                await deleteExpense(context.dataSources, { ...input, ...{ id: parseInt(input.id) } });

                return {
                    code: 200,
                    success: true,
                    message: `${expense.description} berhasil dihapus`,
                    expense,
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: `${expense.description} gagal dihapus`,
                }
            }
        },

        async deleteExpenseMany(_, { input }, context) {
            const expenses = await fetchExpensesByIds(context.dataSources, input);
            const descriptions = expenses.map(expense => expense.description);

            try {
                await deleteExpenseMany(context.dataSources, { ids: input.ids.map(id => parseInt(id)) });

                return {
                    code: 200,
                    success: true,
                    message: createMessageDeleteMany(descriptions, "", " berhasil dihapus"),
                    expenses,
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: createMessageDeleteMany(descriptions, "", " gagal dihapus"),
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