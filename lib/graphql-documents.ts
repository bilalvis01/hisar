import { gql } from "./graphql-tag";

export const GET_BUDGETS = gql(/* GraphQL */ `
    query GetBudget {
        budgets {
            id
            name
            budget
            expense
            balance
            createdAt,
            updatedAt,
        }
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

export const ADD_EXPENSE = gql(/* GraphQL */`
    mutation AddExpense($input: AddExpenseInput!) {
        addExpense(input: $input) {
            code
            success
            message
            expense {
                id
                budgetAccount
                amount
                description
                createdAt
                updatedAt
            }
        }
    }
`);

export const GET_EXPENSES = gql(/* GraphQL */ `
    query GetExpenses {
        expenses {
            id
            description
            budgetAccount
            budgetAccountId
            amount
        }
    }
`);