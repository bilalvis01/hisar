/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Budget = {
  __typename?: 'Budget';
  balance: Scalars['Int']['output'];
  budget: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  expense: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['Int']['output'];
  budgetAccount: Scalars['String']['output'];
  budgetAccountId: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  budgets: Array<Budget>;
  expenses: Array<Expense>;
};

export type GetBudgetQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBudgetQuery = { __typename?: 'Query', budgets: Array<{ __typename?: 'Budget', name: string, budget: number, expense: number, balance: number }> };

export type GetExpensesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExpensesQuery = { __typename?: 'Query', expenses: Array<{ __typename?: 'Expense', id: number, description: string, budgetAccount: string, budgetAccountId: number, amount: number }> };


export const GetBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<GetBudgetQuery, GetBudgetQueryVariables>;
export const GetExpensesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAccount"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<GetExpensesQuery, GetExpensesQueryVariables>;