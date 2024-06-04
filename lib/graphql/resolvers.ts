import { Resolvers, SortOrder } from "./resolvers-types";
import { 
    createBudget, 
    updateBudget, 
    deleteBudget, 
    deleteBudgetMany, 
    createExpense,
    updateExpense,
    deleteExpense,
    deleteExpenseMany,
} from "../database/transactions";
import { 
    fetchBudgets, 
    fetchBudgetByCode, 
    fetchBudgetsByCodes,
} from "../database/budget-fetching";
import { 
    fetchBudgetTransactions,
    fetchBudgetTransactionById,
} from "../database/budget-transaction-fetching";
import { 
    fetchExpenseById,
    fetchExpensesByIds,
} from "../database/expense-fetching";
import createInfo from "../utils/createInfo";
import { RecordNotFoundError, DatabaseError } from "./error";

export const resolvers: Resolvers = {
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

        async budgetByCode(_, { input: { code } }, context) {
            try {
                return await fetchBudgetByCode(context.dataSources, code);
            } catch(error) {
                if (error instanceof RecordNotFoundError) {
                    throw error;
                }

                throw new DatabaseError("Database Error");
            }
        },

        async budgetTransactions(_, { input }, context) {
            try {
                return await fetchBudgetTransactions(
                    context.dataSources, 
                    {
                        ...input,
                        ...{ sortOrder: input.sortOrder && input.sortOrder === SortOrder.Asc ? "asc" : "desc" },
                    }
                );
            } catch(error) {
                if (error instanceof RecordNotFoundError) {
                    throw error;
                }

                throw new DatabaseError("Database Error");
            }
        },

        async budgetTransactionById(_, { input }, context) {
            return await fetchBudgetTransactionById(context.dataSources, 
                { ...input, ...{ id: parseInt(input.id) } }
            );
        }
    },

    Mutation: {
        async createBudget(_, { input }, context) {
            try {
                const budget = await createBudget(context.dataSources, input);

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
                    message: `budget ${input.name} berhasil dibuat`,
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
                const budget = await context.dataSources.budget.findUnique({
                    where: {
                        code: input.code,
                    },
                });

                await updateBudget(context.dataSources, {
                    id: budget.id,
                    name: input.name,
                    description: input.description,
                    amount: input.amount,
                });

                const updatedBudget = await fetchBudgetByCode(context.dataSources, input.code);
                
                return {
                    code: 200,
                    success: true,
                    message: `${input.name} berhasil diperbarui`,
                    budget: updatedBudget,
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
            const budget = await context.dataSources.budget.findUnique({
                where: {
                    code: input.code,
                },
            });

            try {
                await deleteBudget(context.dataSources, { id: budget.id });

                const deletedBudget = await fetchBudgetByCode(context.dataSources, input.code);
                
                return {
                    code: 200,
                    success: true,
                    message: `${budget.name} berhasil dihapus`,
                    budget: deletedBudget,
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
            const budgets = await context.dataSources.budget.findMany({
                where: {
                    code: {
                        in: codes,
                    },
                },
            });
            const budgetNames = budgets.map((budget) => budget.name);
            const budgetIds = budgets.map((budget) => budget.id);

            try {                
                await deleteBudgetMany(context.dataSources, { ids: budgetIds });

                const deletedBudgets = await fetchBudgetsByCodes(context.dataSources, codes);

                return {
                    code: 200,
                    success: true,
                    message: createInfo(budgetNames, "", " berhasil dihapus"),
                    budgets: deletedBudgets,
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
                    message: createInfo(budgetNames, "", ` gagal dihapus`)
                }
            }
        },

        async createExpense(_, { input }, context) {
            try {
                const budget = await context.dataSources.budget.findUnique({
                    where: {
                        code: input.budgetCode,
                    },
                });

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
                await deleteExpenseMany(context.dataSources, { 
                    expenses: expenses.map(
                        (expense) => ({ id: parseInt(expense.id), transactionType: expense.transactionType })
                    )
                });

                return {
                    code: 200,
                    success: true,
                    message: createInfo(descriptions, "", " berhasil dihapus"),
                    expenses,
                };
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    message: createInfo(descriptions, "", ` gagal dihapus ${error.message}`),
                }
            }
        }
    }
}