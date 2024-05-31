/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    query GetExcerptReport {\n        excerptReport {\n            budget\n            expense\n            balance\n        }\n    }\n": types.GetExcerptReportDocument,
    "\n    query GetBudgets {\n        budgets {\n            code\n            name\n            amount\n            expense\n            balance\n            createdAt\n            updatedAt\n        }\n    }\n": types.GetBudgetsDocument,
    "\n    query GetBudgetByCode($input: GetBudgetByCodeInput!) {\n        budgetByCode(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.GetBudgetByCodeDocument,
    "\n    fragment NewBudget on Budget {\n        code\n        name\n        amount\n        expense\n        balance\n        createdAt\n        updatedAt\n    }\n": types.NewBudgetFragmentDoc,
    "\n    mutation CreateBudget($input: CreateBudgetInput!) {\n        createBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.CreateBudgetDocument,
    "\n    mutation UpdateBudget($input: UpdateBudgetInput!) {\n        updateBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.UpdateBudgetDocument,
    "\n    mutation DeleteBudget($input: DeleteBudgetInput!) {\n        deleteBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.DeleteBudgetDocument,
    "\n    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {\n        deleteBudgetMany(input: $input) {\n            code\n            success\n            message\n            budgets {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.DeleteBudgetManyDocument,
    "\n    fragment NewBudgetTransaction on BudgetTransaction {\n        id\n        budgetCode\n        budgetName\n        description\n        amount\n        balance\n        transactionType\n        createdAt\n        updatedAt\n    }\n": types.NewBudgetTransactionFragmentDoc,
    "\n    query GetBudgetTransactions($input: GetBudgetTransactionsInput!) {\n        budgetTransactions(input: $input) {\n            id\n            budgetCode\n            budgetName\n            description\n            amount\n            balance\n            transactionType\n            createdAt\n            updatedAt\n        }\n    }\n": types.GetBudgetTransactionsDocument,
    "\n    query GetBudgetTransactionById($input: GetBudgetTransactionByIdInput!) {\n        budgetTransactionById(input: $input) {\n            code\n            success\n            message\n            budgetTransaction {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.GetBudgetTransactionByIdDocument,
    "\n    mutation CreateExpense($input: CreateExpenseInput!) {\n        createExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode,\n                budgetName,\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.CreateExpenseDocument,
    "\n    mutation UpdateExpense($input: UpdateExpenseInput!) {\n        updateExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.UpdateExpenseDocument,
    "\n    mutation DeleteExpense($input: DeleteExpenseInput!) {\n        deleteExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.DeleteExpenseDocument,
    "\n    mutation DeleteExpenseMany($input: DeleteExpenseManyInput!) {\n        deleteExpenseMany(input: $input) {\n            code\n            success\n            message\n            expenses {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.DeleteExpenseManyDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetExcerptReport {\n        excerptReport {\n            budget\n            expense\n            balance\n        }\n    }\n"): (typeof documents)["\n    query GetExcerptReport {\n        excerptReport {\n            budget\n            expense\n            balance\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetBudgets {\n        budgets {\n            code\n            name\n            amount\n            expense\n            balance\n            createdAt\n            updatedAt\n        }\n    }\n"): (typeof documents)["\n    query GetBudgets {\n        budgets {\n            code\n            name\n            amount\n            expense\n            balance\n            createdAt\n            updatedAt\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetBudgetByCode($input: GetBudgetByCodeInput!) {\n        budgetByCode(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetBudgetByCode($input: GetBudgetByCodeInput!) {\n        budgetByCode(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment NewBudget on Budget {\n        code\n        name\n        amount\n        expense\n        balance\n        createdAt\n        updatedAt\n    }\n"): (typeof documents)["\n    fragment NewBudget on Budget {\n        code\n        name\n        amount\n        expense\n        balance\n        createdAt\n        updatedAt\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateBudget($input: CreateBudgetInput!) {\n        createBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation CreateBudget($input: CreateBudgetInput!) {\n        createBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation UpdateBudget($input: UpdateBudgetInput!) {\n        updateBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation UpdateBudget($input: UpdateBudgetInput!) {\n        updateBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteBudget($input: DeleteBudgetInput!) {\n        deleteBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteBudget($input: DeleteBudgetInput!) {\n        deleteBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {\n        deleteBudgetMany(input: $input) {\n            code\n            success\n            message\n            budgets {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {\n        deleteBudgetMany(input: $input) {\n            code\n            success\n            message\n            budgets {\n                code\n                name\n                amount\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment NewBudgetTransaction on BudgetTransaction {\n        id\n        budgetCode\n        budgetName\n        description\n        amount\n        balance\n        transactionType\n        createdAt\n        updatedAt\n    }\n"): (typeof documents)["\n    fragment NewBudgetTransaction on BudgetTransaction {\n        id\n        budgetCode\n        budgetName\n        description\n        amount\n        balance\n        transactionType\n        createdAt\n        updatedAt\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetBudgetTransactions($input: GetBudgetTransactionsInput!) {\n        budgetTransactions(input: $input) {\n            id\n            budgetCode\n            budgetName\n            description\n            amount\n            balance\n            transactionType\n            createdAt\n            updatedAt\n        }\n    }\n"): (typeof documents)["\n    query GetBudgetTransactions($input: GetBudgetTransactionsInput!) {\n        budgetTransactions(input: $input) {\n            id\n            budgetCode\n            budgetName\n            description\n            amount\n            balance\n            transactionType\n            createdAt\n            updatedAt\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetBudgetTransactionById($input: GetBudgetTransactionByIdInput!) {\n        budgetTransactionById(input: $input) {\n            code\n            success\n            message\n            budgetTransaction {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetBudgetTransactionById($input: GetBudgetTransactionByIdInput!) {\n        budgetTransactionById(input: $input) {\n            code\n            success\n            message\n            budgetTransaction {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateExpense($input: CreateExpenseInput!) {\n        createExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode,\n                budgetName,\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation CreateExpense($input: CreateExpenseInput!) {\n        createExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode,\n                budgetName,\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation UpdateExpense($input: UpdateExpenseInput!) {\n        updateExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation UpdateExpense($input: UpdateExpenseInput!) {\n        updateExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteExpense($input: DeleteExpenseInput!) {\n        deleteExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteExpense($input: DeleteExpenseInput!) {\n        deleteExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteExpenseMany($input: DeleteExpenseManyInput!) {\n        deleteExpenseMany(input: $input) {\n            code\n            success\n            message\n            expenses {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteExpenseMany($input: DeleteExpenseManyInput!) {\n        deleteExpenseMany(input: $input) {\n            code\n            success\n            message\n            expenses {\n                id\n                budgetCode\n                budgetName\n                description\n                amount\n                balance\n                transactionType\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;