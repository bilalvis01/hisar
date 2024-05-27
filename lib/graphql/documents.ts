import { gql } from "./generated";

export const GET_EXCERPT_REPORT = gql(/* GraphQL */ `
    query GetExcerptReport {
        excerptReport {
            budget
            expense
            balance
        }
    }
`);

export const GET_BUDGETS = gql(/* GraphQL */ `
    query GetBudget($input: GetBudgetInput) {
        budgets(input: $input) {
            code
            name
            amount
            expense
            balance
            createdAt
            updatedAt
        }
    }
`);

export const GET_BUDGET_BY_CODE = gql(/* GraphQL */ `
    query GetBudgetByCode($code: String!) {
        budgetByCode(code: $code) {
            code
            success
            message
            budget {
                code
                name
                amount
                expense
                balance
                transactions {
                    id
                    description
                    expense
                    balance
                    createdAt
                    updatedAt
                }
                createdAt
                updatedAt
            }
        }
    }
`);

export const NEW_BUDGET = gql(/* GraphQL */ `
    fragment NewBudget on Budget {
        code
        name
        amount
        expense
        balance
        createdAt
        updatedAt
    }
`);

export const CREATE_BUDGET = gql(/* GraphQL */`
    mutation CreateBudget($input: CreateBudgetInput!) {
        createBudget(input: $input) {
            code
            success
            message
            budget {
                code
                name
                amount
                expense
                balance
                createdAt
                updatedAt
            }
        }
    }
`);

export const UPDATE_BUDGET = gql(/* GraphQL */`
    mutation UpdateBudget($input: UpdateBudgetInput!) {
        updateBudget(input: $input) {
            code
            success
            message
            budget {
                code
                name
                amount
                expense
                balance
                transactions {
                    id
                    description
                    expense
                    balance
                    createdAt
                    updatedAt
                }
                createdAt
                updatedAt
            }
        }
    }
`);

export const DELETE_BUDGET = gql(/* GraphQL */`
    mutation DeleteBudget($input: DeleteBudgetInput!) {
        deleteBudget(input: $input) {
            code
            success
            message
            budget {
                code
                name
                amount
                expense
                balance
                createdAt
                updatedAt
            }
        }
    }
`);

export const DELETE_BUDGET_MANY = gql(/* GraphQL */`
    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {
        deleteBudgetMany(input: $input) {
            code
            success
            message
            budgets {
                code
                name
                amount
                expense
                balance
                createdAt
                updatedAt
            }
        }
    }
`);

export const CREATE_EXPENSE = gql(/* GraphQL */`
    mutation CreateExpense($input: CreateExpenseInput!) {
        createExpense(input: $input) {
            code
            success
            message
            expense {
                id
                budgetCode,
                budgetName,
                amount
                description
                createdAt
                updatedAt
            }
        }
    }
`);

export const UPDATE_EXPENSE = gql(/* GraphQL */`
    mutation UpdateExpense($input: UpdateExpenseInput!) {
        updateExpense(input: $input) {
            code
            success
            message
            expense {
                id
                budgetCode
                budgetName
                amount
                description
                createdAt
                updatedAt
            }
        }
    }
`);

export const DELETE_EXPENSE = gql(/* GraphQL */`
    mutation DeleteExpense($input: DeleteExpenseInput!) {
        deleteExpense(input: $input) {
            code
            success
            message
            expense {
                id
                budgetCode
                budgetName
                amount
                description
                createdAt
                updatedAt
            }
        }
    }
`);

export const DELETE_EXPENSE_MANY = gql(/* GraphQL */`
    mutation DeleteExpenseMany($input: DeleteExpenseManyInput!) {
        deleteExpenseMany(input: $input) {
            code
            success
            message
            expenses {
                id
                budgetCode
                budgetName
                amount
                description
                createdAt
                updatedAt
            }
        }
    }
`);

export const NEW_EXPENSE = gql(/* GraphQL */`
    fragment NewExpense on Expense {
        id
        description
        budgetCode
        budgetName
        amount
        createdAt
        updatedAt
    }
`);

export const GET_EXPENSES = gql(/* GraphQL */ `
    query GetExpenses {
        expenses {
            id
            description
            budgetCode
            budgetName
            amount
            createdAt
            updatedAt
        }
    }
`);

export const GET_EXPENSE_BY_ID = gql(/* GraphQL */ `
    query GetExpenseById($id: String!) {
        expenseById(id: $id) {
            code
            success
            message
            expense {
                id
                description
                budgetCode
                budgetName
                amount
                createdAt
                updatedAt
            }
        }
    }
`);