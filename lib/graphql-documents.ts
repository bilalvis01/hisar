import { gql } from "./graphql-tag";

export const GET_BUDGETS = gql(/* GraphQL */ `
    query GetBudget {
        budgets {
            name
            budget
            expense
            balance
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