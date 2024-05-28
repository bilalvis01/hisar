import { gql } from "./generated";

export const GET_EXPENSE_BY_ID = gql(/* GraphQL */ `
    query GetExpenseById($id: String!) {
        expenseById(id: $id) {
            code
            success
            message
            expense {
                id
                budgetCode
                budgetName
                description
                amount
                balance
                transactionType
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
                description
                amount
                balance
                transactionType
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
                description
                amount
                balance
                transactionType
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
                description
                amount
                balance
                transactionType
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
                description
                amount
                balance
                transactionType
                createdAt
                updatedAt
            }
        }
    }
`);