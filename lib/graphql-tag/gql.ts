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
    "\n    query GetBudget {\n        budgets {\n            id\n            code\n            name\n            budget\n            expense\n            balance\n            ledgerEntries {\n                id\n                code\n                description\n                debit\n                credit\n                balance\n                createdAt\n                updatedAt\n            }\n            createdAt\n            updatedAt\n        }\n    }\n": types.GetBudgetDocument,
    "\n    query GetBudgetByCode($code: String!) {\n        budgetByCode(code: $code) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                ledgerEntries {\n                    id\n                    code\n                    description\n                    debit\n                    credit\n                    balance\n                    createdAt\n                    updatedAt\n                }\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.GetBudgetByCodeDocument,
    "\n    fragment NewBudget on Budget {\n        id\n        code\n        name\n        budget\n        expense\n        balance\n        ledgerEntries {\n            id\n            code\n            description\n            debit\n            credit\n            balance\n            createdAt\n            updatedAt\n        }\n        createdAt\n        updatedAt\n    }\n": types.NewBudgetFragmentDoc,
    "\n    mutation CreateBudget($input: CreateBudgetInput!) {\n        createBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.CreateBudgetDocument,
    "\n    mutation UpdateBudget($input: UpdateBudgetInput!) {\n        updateBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                ledgerEntries {\n                    id\n                    code\n                    description\n                    debit\n                    credit\n                    balance\n                    createdAt\n                    updatedAt\n                }\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.UpdateBudgetDocument,
    "\n    mutation DeleteBudget($input: DeleteBudgetInput!) {\n        deleteBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.DeleteBudgetDocument,
    "\n    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {\n        deleteBudgetMany(input: $input) {\n            code\n            success\n            message\n            budgets {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.DeleteBudgetManyDocument,
    "\n    mutation CreateExpense($input: CreateExpenseInput!) {\n        createExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                budgetAccount\n                amount\n                description\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.CreateExpenseDocument,
    "\n    mutation UpdateExpense($input: UpdateExpenseInput!) {\n        updateExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                budgetAccount\n                amount\n                description\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.UpdateExpenseDocument,
    "\n    fragment NewExpense on Expense {\n        id\n        code\n        budgetAccount\n        amount\n        description\n        createdAt\n        updatedAt\n    }\n": types.NewExpenseFragmentDoc,
    "\n    query GetExpenses {\n        expenses {\n            id\n            code\n            description\n            budgetAccount\n            amount\n            createdAt\n            updatedAt\n        }\n    }\n": types.GetExpensesDocument,
    "\n    query GetExpenseByCode($code: Int!) {\n        expenseByCode(code: $code) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                description\n                budgetAccount\n                amount\n                createdAt\n                updatedAt\n            }\n        }\n    }\n": types.GetExpenseByCodeDocument,
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
export function gql(source: "\n    query GetBudget {\n        budgets {\n            id\n            code\n            name\n            budget\n            expense\n            balance\n            ledgerEntries {\n                id\n                code\n                description\n                debit\n                credit\n                balance\n                createdAt\n                updatedAt\n            }\n            createdAt\n            updatedAt\n        }\n    }\n"): (typeof documents)["\n    query GetBudget {\n        budgets {\n            id\n            code\n            name\n            budget\n            expense\n            balance\n            ledgerEntries {\n                id\n                code\n                description\n                debit\n                credit\n                balance\n                createdAt\n                updatedAt\n            }\n            createdAt\n            updatedAt\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetBudgetByCode($code: String!) {\n        budgetByCode(code: $code) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                ledgerEntries {\n                    id\n                    code\n                    description\n                    debit\n                    credit\n                    balance\n                    createdAt\n                    updatedAt\n                }\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetBudgetByCode($code: String!) {\n        budgetByCode(code: $code) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                ledgerEntries {\n                    id\n                    code\n                    description\n                    debit\n                    credit\n                    balance\n                    createdAt\n                    updatedAt\n                }\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment NewBudget on Budget {\n        id\n        code\n        name\n        budget\n        expense\n        balance\n        ledgerEntries {\n            id\n            code\n            description\n            debit\n            credit\n            balance\n            createdAt\n            updatedAt\n        }\n        createdAt\n        updatedAt\n    }\n"): (typeof documents)["\n    fragment NewBudget on Budget {\n        id\n        code\n        name\n        budget\n        expense\n        balance\n        ledgerEntries {\n            id\n            code\n            description\n            debit\n            credit\n            balance\n            createdAt\n            updatedAt\n        }\n        createdAt\n        updatedAt\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateBudget($input: CreateBudgetInput!) {\n        createBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation CreateBudget($input: CreateBudgetInput!) {\n        createBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation UpdateBudget($input: UpdateBudgetInput!) {\n        updateBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                ledgerEntries {\n                    id\n                    code\n                    description\n                    debit\n                    credit\n                    balance\n                    createdAt\n                    updatedAt\n                }\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation UpdateBudget($input: UpdateBudgetInput!) {\n        updateBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                ledgerEntries {\n                    id\n                    code\n                    description\n                    debit\n                    credit\n                    balance\n                    createdAt\n                    updatedAt\n                }\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteBudget($input: DeleteBudgetInput!) {\n        deleteBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteBudget($input: DeleteBudgetInput!) {\n        deleteBudget(input: $input) {\n            code\n            success\n            message\n            budget {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {\n        deleteBudgetMany(input: $input) {\n            code\n            success\n            message\n            budgets {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation DeleteBudgetMany($input: DeleteBudgetManyInput!) {\n        deleteBudgetMany(input: $input) {\n            code\n            success\n            message\n            budgets {\n                id\n                code\n                name\n                budget\n                expense\n                balance\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateExpense($input: CreateExpenseInput!) {\n        createExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                budgetAccount\n                amount\n                description\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation CreateExpense($input: CreateExpenseInput!) {\n        createExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                budgetAccount\n                amount\n                description\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation UpdateExpense($input: UpdateExpenseInput!) {\n        updateExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                budgetAccount\n                amount\n                description\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    mutation UpdateExpense($input: UpdateExpenseInput!) {\n        updateExpense(input: $input) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                budgetAccount\n                amount\n                description\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    fragment NewExpense on Expense {\n        id\n        code\n        budgetAccount\n        amount\n        description\n        createdAt\n        updatedAt\n    }\n"): (typeof documents)["\n    fragment NewExpense on Expense {\n        id\n        code\n        budgetAccount\n        amount\n        description\n        createdAt\n        updatedAt\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetExpenses {\n        expenses {\n            id\n            code\n            description\n            budgetAccount\n            amount\n            createdAt\n            updatedAt\n        }\n    }\n"): (typeof documents)["\n    query GetExpenses {\n        expenses {\n            id\n            code\n            description\n            budgetAccount\n            amount\n            createdAt\n            updatedAt\n        }\n    }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query GetExpenseByCode($code: Int!) {\n        expenseByCode(code: $code) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                description\n                budgetAccount\n                amount\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetExpenseByCode($code: Int!) {\n        expenseByCode(code: $code) {\n            code\n            success\n            message\n            expense {\n                id\n                code\n                description\n                budgetAccount\n                amount\n                createdAt\n                updatedAt\n            }\n        }\n    }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;