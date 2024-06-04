import { gql } from "./generated";

export const CREATE_EXPENSE = gql(/* GraphQL */`
    mutation CreateExpense($input: CreateExpenseInput!) {
        createExpense(input: $input) {
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
`);

export const UPDATE_EXPENSE = gql(/* GraphQL */`
    mutation UpdateExpense($input: UpdateExpenseInput!) {
        updateExpense(input: $input) {
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
`);

export const DELETE_EXPENSE = gql(/* GraphQL */`
    mutation DeleteExpense($input: DeleteExpenseInput!) {
        deleteExpense(input: $input) {
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
`);