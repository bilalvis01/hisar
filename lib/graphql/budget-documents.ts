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
    query GetBudgets {
        budgets {
            code
            name
            description
            amount
            expense
            balance
            createdAt
            updatedAt
        }
    }
`);

export const GET_BUDGET_BY_CODE = gql(/* GraphQL */ `
    query GetBudgetByCode($input: GetBudgetByCodeInput!) {
        budgetByCode(input: $input) {
            code
            name
            description
            amount
            expense
            balance
            createdAt
            updatedAt
        }
    }
`);

export const NEW_BUDGET = gql(/* GraphQL */ `
    fragment NewBudget on Budget {
        code
        name
        description
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
            name
            description
            amount
            expense
            balance
            createdAt
            updatedAt
        }
    }
`);

export const UPDATE_BUDGET = gql(/* GraphQL */`
    mutation UpdateBudget($input: UpdateBudgetInput!) {
        updateBudget(input: $input) {
            code
            name
            description
            amount
            expense
            balance
            createdAt
            updatedAt
        }
    }
`);

export const DELETE_BUDGET = gql(/* GraphQL */`
    mutation DeleteBudget($input: DeleteBudgetInput!) {
        deleteBudget(input: $input) {
            code
            name
            description
            amount
            expense
            balance
            createdAt
            updatedAt
        }
    }
`);