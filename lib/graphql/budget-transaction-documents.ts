import { gql } from "./generated";

export const GET_BUDGET_TRANSACTIONS = gql(/* GraphQL */ `
    query GetBudgetTransactions($input: GetBudgetTransactionsInput!) {
        budgetTransactions(input: $input) {
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
`);

export const GET_BUDGET_TRANSACTION_BY_ID = gql(/* GraphQL */ `
    query GetBudgetTransactionById($input: GetBudgetTransactionByIdInput!) {
        budgetTransactionById(input: $input) {
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
`);