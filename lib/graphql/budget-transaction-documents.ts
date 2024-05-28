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