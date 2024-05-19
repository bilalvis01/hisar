import { gql } from "./graphql-tag";

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
    query GetBudget {
        budgets {
            id
            code
            name
            budget
            expense
            balance
            ledgerEntries {
                id
                code
                description
                debit
                credit
                balance
                createdAt
                updatedAt
            }
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
                id
                code
                name
                budget
                expense
                balance
                ledgerEntries {
                    id
                    code
                    description
                    debit
                    credit
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
        id
        code
        name
        budget
        expense
        balance
        ledgerEntries {
            id
            code
            description
            debit
            credit
            balance
            createdAt
            updatedAt
        }
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
                id
                code
                name
                budget
                expense
                balance
                ledgerEntries {
                    id
                    code
                    description
                    debit
                    credit
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

export const UPDATE_BUDGET = gql(/* GraphQL */`
    mutation UpdateBudget($input: UpdateBudgetInput!) {
        updateBudget(input: $input) {
            code
            success
            message
            budget {
                id
                code
                name
                budget
                expense
                balance
                ledgerEntries {
                    id
                    code
                    description
                    debit
                    credit
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
                id
                code
                name
                budget
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
                id
                code
                name
                budget
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
                code
                budgetAccount
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
                code
                budgetAccount
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
        code
        description
        budgetAccount
        amount
        createdAt
        updatedAt
    }
`);

export const GET_EXPENSES = gql(/* GraphQL */ `
    query GetExpenses {
        expenses {
            id
            code
            description
            budgetAccount
            amount
            createdAt
            updatedAt
        }
    }
`);

export const GET_EXPENSE_BY_CODE = gql(/* GraphQL */ `
    query GetExpenseByCode($code: String!) {
        expenseByCode(code: $code) {
            code
            success
            message
            expense {
                id
                code
                description
                budgetAccount
                amount
                createdAt
                updatedAt
            }
        }
    }
`);