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
import { RecordNotFoundError } from "./error";

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
            });
        },

        async budgets(_, __, context) {
            return await fetchBudgets(context.dataSources);
        },

        async budgetByCode(_, { input: { code } }, context) {
            return await fetchBudgetByCode(context.dataSources, code);
        },

        async budgetTransactions(_, { input }, context) {
            return await fetchBudgetTransactions(
                context.dataSources, 
                {
                    ...input,
                    ...{ sortOrder: input.sortOrder && input.sortOrder === SortOrder.Asc ? "asc" : "desc" },
                }
            );
        },

        async budgetTransactionById(_, { input }, context) {
            return await fetchBudgetTransactionById(context.dataSources, 
                { ...input, ...{ id: parseInt(input.id) } }
            );
        }
    },

    Mutation: {
        async createBudget(_, { input }, context) {
            const budget = await createBudget(context.dataSources, input);
                
            return {
                code: budget.code,
                name: budget.name,
                amount: input.amount,
                expense: BigInt(0),
                transactions: [],
                balance: input.amount,
                createdAt: budget.createdAt,
                updatedAt: budget.updatedAt,
            };
        },

        async updateBudget(_, { input }, context) {
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

            return await fetchBudgetByCode(context.dataSources, input.code);
        },

        async deleteBudget(_, { input: { codes } }, context) {
            const deletedBudgets = await fetchBudgetsByCodes(context.dataSources, codes);

            const budgets = await context.dataSources.budget.findMany({
                where: {
                    code: {
                        in: codes,
                    },
                },
            });
            
            const budgetIds = budgets.map((budget) => budget.id);

            await deleteBudgetMany(context.dataSources, { ids: budgetIds });

            return deletedBudgets;
        },

        async createExpense(_, { input }, context) {
            const budget = await context.dataSources.budget.findUnique({
                where: {
                    code: input.budgetCode,
                },
            });

            const { id: expenseId } = await createExpense(context.dataSources, { 
                ...input,
                ...{ budgetId: budget.id },
            });

            return await fetchExpenseById(context.dataSources, { id: expenseId });
        },

        async updateExpense(_, { input }, context) {
            const { id: expenseId } = await updateExpense(
                context.dataSources, 
                { ...input, ...{ id: parseInt(input.id) } },
            );

            return await fetchExpenseById(context.dataSources, { id: expenseId });
        },

        async deleteExpense(_, { input }, context) {
            const ids = input.ids.map((id) => parseInt(id));

            const deletedExpenses = await fetchExpensesByIds(context.dataSources, { ids });

            await deleteExpenseMany(context.dataSources, { 
                expenses: deletedExpenses.map(
                    (expense) => ({ id: parseInt(expense.id), transactionType: expense.transactionType })
                )
            });

            return deletedExpenses;
        }
    }
}