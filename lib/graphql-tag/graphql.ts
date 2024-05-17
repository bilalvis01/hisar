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
  DateTimeIso: { input: Date; output: Date; }
};

export type AddExpenseInput = {
  amount: Scalars['Int']['input'];
  budgetAccountId: Scalars['Int']['input'];
  description: Scalars['String']['input'];
};

export type AddExpensePayload = {
  __typename?: 'AddExpensePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<Expense>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Budget = {
  __typename?: 'Budget';
  balance: Scalars['Int']['output'];
  budget: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTimeIso']['output'];
  expense: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  ledgerEntries: Array<BudgetLedgerEntry>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeIso']['output'];
};

export type BudgetByCodePayload = {
  __typename?: 'BudgetByCodePayload';
  budget?: Maybe<Budget>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type BudgetLedgerEntry = {
  __typename?: 'BudgetLedgerEntry';
  balance: Scalars['Int']['output'];
  createdAt: Scalars['DateTimeIso']['output'];
  credit?: Maybe<Scalars['Int']['output']>;
  debit?: Maybe<Scalars['Int']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['DateTimeIso']['output'];
};

export type CreateBudgetInput = {
  budget: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type CreateBudgetPayload = {
  __typename?: 'CreateBudgetPayload';
  budget?: Maybe<Budget>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteBudgetInput = {
  id: Scalars['Int']['input'];
};

export type DeleteBudgetPayload = {
  __typename?: 'DeleteBudgetPayload';
  budget?: Maybe<Budget>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ExcerptReport = {
  __typename?: 'ExcerptReport';
  balance: Scalars['Int']['output'];
  budget: Scalars['Int']['output'];
  expense: Scalars['Int']['output'];
};

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['Int']['output'];
  budgetAccount: Scalars['String']['output'];
  budgetAccountId: Scalars['Int']['output'];
  createdAt: Scalars['DateTimeIso']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['DateTimeIso']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addExpense: AddExpensePayload;
  createBudget: CreateBudgetPayload;
  deleteBudget: DeleteBudgetPayload;
  updateBudget: UpdateBudgetPayload;
};


export type MutationAddExpenseArgs = {
  input: AddExpenseInput;
};


export type MutationCreateBudgetArgs = {
  input: CreateBudgetInput;
};


export type MutationDeleteBudgetArgs = {
  input: DeleteBudgetInput;
};


export type MutationUpdateBudgetArgs = {
  input: UpdateBudgetInput;
};

export type Query = {
  __typename?: 'Query';
  budgetByCode: BudgetByCodePayload;
  budgets: Array<Budget>;
  excerptReport: ExcerptReport;
  expenses: Array<Expense>;
};


export type QueryBudgetByCodeArgs = {
  code: Scalars['String']['input'];
};

export type UpdateBudgetInput = {
  balance: Scalars['Int']['input'];
  code: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type UpdateBudgetPayload = {
  __typename?: 'UpdateBudgetPayload';
  budget?: Maybe<Budget>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type GetExcerptReportQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExcerptReportQuery = { __typename?: 'Query', excerptReport: { __typename?: 'ExcerptReport', budget: number, expense: number, balance: number } };

export type GetBudgetQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBudgetQuery = { __typename?: 'Query', budgets: Array<{ __typename?: 'Budget', id: number, code: string, name: string, budget: number, expense: number, balance: number, createdAt: Date, updatedAt: Date, ledgerEntries: Array<{ __typename?: 'BudgetLedgerEntry', id: number, description: string, debit?: number | null, credit?: number | null, balance: number, createdAt: Date, updatedAt: Date }> }> };

export type GetBudgetByCodeQueryVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type GetBudgetByCodeQuery = { __typename?: 'Query', budgetByCode: { __typename?: 'BudgetByCodePayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', id: number, code: string, name: string, budget: number, expense: number, balance: number, createdAt: Date, updatedAt: Date, ledgerEntries: Array<{ __typename?: 'BudgetLedgerEntry', id: number, description: string, debit?: number | null, credit?: number | null, balance: number, createdAt: Date, updatedAt: Date }> } | null } };

export type NewBudgetFragment = { __typename?: 'Budget', id: number, code: string, name: string, budget: number, expense: number, balance: number, createdAt: Date, updatedAt: Date, ledgerEntries: Array<{ __typename?: 'BudgetLedgerEntry', id: number, description: string, debit?: number | null, credit?: number | null, balance: number, createdAt: Date, updatedAt: Date }> } & { ' $fragmentName'?: 'NewBudgetFragment' };

export type CreateBudgetMutationVariables = Exact<{
  input: CreateBudgetInput;
}>;


export type CreateBudgetMutation = { __typename?: 'Mutation', createBudget: { __typename?: 'CreateBudgetPayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', id: number, name: string, budget: number, expense: number, balance: number, createdAt: Date, updatedAt: Date } | null } };

export type UpdateBudgetMutationVariables = Exact<{
  input: UpdateBudgetInput;
}>;


export type UpdateBudgetMutation = { __typename?: 'Mutation', updateBudget: { __typename?: 'UpdateBudgetPayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', id: number, name: string, budget: number, expense: number, balance: number, createdAt: Date, updatedAt: Date, ledgerEntries: Array<{ __typename?: 'BudgetLedgerEntry', id: number, description: string, debit?: number | null, credit?: number | null, balance: number, createdAt: Date, updatedAt: Date }> } | null } };

export type DeleteBudgetMutationVariables = Exact<{
  input: DeleteBudgetInput;
}>;


export type DeleteBudgetMutation = { __typename?: 'Mutation', deleteBudget: { __typename?: 'DeleteBudgetPayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', id: number, name: string, budget: number, expense: number, balance: number, createdAt: Date, updatedAt: Date } | null } };

export type AddExpenseMutationVariables = Exact<{
  input: AddExpenseInput;
}>;


export type AddExpenseMutation = { __typename?: 'Mutation', addExpense: { __typename?: 'AddExpensePayload', code: number, success: boolean, message: string, expense?: { __typename?: 'Expense', id: number, budgetAccount: string, amount: number, description: string, createdAt: Date, updatedAt: Date } | null } };

export type NewExpenseFragment = { __typename?: 'Expense', id: number, budgetAccount: string, amount: number, description: string, createdAt: Date, updatedAt: Date } & { ' $fragmentName'?: 'NewExpenseFragment' };

export type GetExpensesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExpensesQuery = { __typename?: 'Query', expenses: Array<{ __typename?: 'Expense', id: number, description: string, budgetAccount: string, budgetAccountId: number, amount: number }> };

export const NewBudgetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewBudget"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Budget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"ledgerEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<NewBudgetFragment, unknown>;
export const NewExpenseFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewExpense"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Expense"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAccount"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<NewExpenseFragment, unknown>;
export const GetExcerptReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExcerptReport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"excerptReport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<GetExcerptReportQuery, GetExcerptReportQueryVariables>;
export const GetBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"ledgerEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetBudgetQuery, GetBudgetQueryVariables>;
export const GetBudgetByCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgetByCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgetByCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"ledgerEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetBudgetByCodeQuery, GetBudgetByCodeQueryVariables>;
export const CreateBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CreateBudgetMutation, CreateBudgetMutationVariables>;
export const UpdateBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"ledgerEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"debit"}},{"kind":"Field","name":{"kind":"Name","value":"credit"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateBudgetMutation, UpdateBudgetMutationVariables>;
export const DeleteBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteBudgetMutation, DeleteBudgetMutationVariables>;
export const AddExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"expense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAccount"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<AddExpenseMutation, AddExpenseMutationVariables>;
export const GetExpensesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAccount"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<GetExpensesQuery, GetExpensesQueryVariables>;