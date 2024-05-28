import { ApolloServer } from "@apollo/server";
import { GraphQLScalarType, Kind } from "graphql";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Resolvers } from "../../../lib/graphql/resolvers-types";
import { readFileSync } from 'fs';
import { PrismaClient } from "@prisma/client";
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
    fetchBudgets, 
    fetchBudgetByCode, 
    fetchBudgetsByCodes,
    mapRawBudgetData,
} from "../../../lib/database/budget-fetching";
import { 
    fetchBudgetTransactions,
} from "../../../lib/database/budget-transaction-fetching";
import { 
    fetchExpenseById,
    fetchExpensesByIds,
} from "../../../lib/database/expense-fetching";
import { 
    DateTimeTypeDefinition, 
    DateTimeResolver,
} from "graphql-scalars";
import createMessageDeleteMany from "../../../lib/utils/createMessageDeleteMany";
import expenseID from "../../../lib/utils/expenseID";
import { BUDGET_EXPENSE_ACCOUNT_CODE } from "../../../lib/database/account-code";
import { BUDGET_FUNDING } from "../../../lib/database/budget-transaction-type";

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

        async budgets(_, __, context) {
            return await fetchBudgets(context.dataSources);
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

            return {
                code: 200,
                success: true,
                message: "",
                budget,
            }
        },

        async budgetTransactions(_, { input }, context) {
            return fetchBudgetTransactions(context.dataSources, input);
        },

        async expenseById(_, { id }, context) {
            const expense = await fetchExpenseById(context.dataSources, { id: parseInt(id) });

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
            const budget = await fetchBudgetByCode(context.dataSources, input.code);

            try {
                await deleteBudget(context.dataSources, { id: budget.id });
                return {
                    code: 200,
                    success: true,
                    message: `${budget.name} berhasil dihapus`,
                    budget,
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
            const budgetIds = budgets.map((budget) => budget.id);

            try {                
                await deleteBudgetMany(context.dataSources, { ids: budgetIds });

                return {
                    code: 200,
                    success: true,
                    message: createMessageDeleteMany(budgetNames, "", " berhasil dihapus"),
                    budgets,
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

                const { id: expenseId } = await createExpense(context.dataSources, { 
                    ...input,
                    ...{ budgetId: budget.id },
                });

                const expense = await fetchExpenseById(context.dataSources, { id: expenseId });

                return {
                    code: 200,
                    success: true,
                    message: `${expense.description} berhasil ditambahkan`,
                    expense,
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

                const { id: expenseId } = await updateExpense(
                    context.dataSources, 
                    { ...input, ...{ id: parseInt(input.id) } },
                );

                const expense = await fetchExpenseById(context.dataSources, { id: expenseId });

                return {
                    code: 200,
                    success: true,
                    message: `${input.description} berhasil diperbarui`,
                    expense,
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
            const expense = await fetchExpenseById(context.dataSources, { id: parseInt(input.id) });

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
            const ids = input.ids.map((id) => parseInt(id));
            const expenses = await fetchExpensesByIds(context.dataSources, { ids });
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