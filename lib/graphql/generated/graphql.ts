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
  DateTime: { input: string; output: string; }
  Money: { input: number; output: number; }
};

export type Budget = {
  __typename?: 'Budget';
  amount: Scalars['Money']['output'];
  balance: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  expense: Scalars['Money']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BudgetTransaction = {
  __typename?: 'BudgetTransaction';
  amount: Scalars['Money']['output'];
  balance: Scalars['Money']['output'];
  budgetCode: Scalars['String']['output'];
  budgetName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  transactionType: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateBudgetInput = {
  amount: Scalars['Money']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateBudgetPayload = {
  __typename?: 'CreateBudgetPayload';
  budget?: Maybe<Budget>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateExpenseInput = {
  amount: Scalars['Money']['input'];
  budgetCode: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type CreateExpensePayload = {
  __typename?: 'CreateExpensePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<BudgetTransaction>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteBudgetInput = {
  code: Scalars['String']['input'];
};

export type DeleteBudgetManyInput = {
  codes: Array<Scalars['String']['input']>;
};

export type DeleteBudgetManyPayload = {
  __typename?: 'DeleteBudgetManyPayload';
  budgets?: Maybe<Array<Budget>>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteBudgetPayload = {
  __typename?: 'DeleteBudgetPayload';
  budget?: Maybe<Budget>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteExpenseInput = {
  id: Scalars['String']['input'];
};

export type DeleteExpenseManyInput = {
  ids: Array<Scalars['String']['input']>;
};

export type DeleteExpenseManyPayload = {
  __typename?: 'DeleteExpenseManyPayload';
  code: Scalars['Int']['output'];
  expenses?: Maybe<Array<BudgetTransaction>>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteExpensePayload = {
  __typename?: 'DeleteExpensePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<BudgetTransaction>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ExcerptReport = {
  __typename?: 'ExcerptReport';
  balance: Scalars['Money']['output'];
  budget: Scalars['Money']['output'];
  expense: Scalars['Money']['output'];
};

export type GetBudgetByCodeInput = {
  code: Scalars['String']['input'];
};

export type GetBudgetTransactionByIdInput = {
  id: Scalars['String']['input'];
  transactionType?: InputMaybe<Scalars['String']['input']>;
};

export type GetBudgetTransactionsInput = {
  budgetCode?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<SortOrder>;
  transactionType?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createBudget: CreateBudgetPayload;
  createExpense: CreateExpensePayload;
  deleteBudget: DeleteBudgetPayload;
  deleteBudgetMany: DeleteBudgetManyPayload;
  deleteExpense: DeleteExpensePayload;
  deleteExpenseMany: DeleteExpenseManyPayload;
  updateBudget: UpdateBudgetPayload;
  updateExpense: UpdateExpensePayload;
};


export type MutationCreateBudgetArgs = {
  input: CreateBudgetInput;
};


export type MutationCreateExpenseArgs = {
  input: CreateExpenseInput;
};


export type MutationDeleteBudgetArgs = {
  input: DeleteBudgetInput;
};


export type MutationDeleteBudgetManyArgs = {
  input: DeleteBudgetManyInput;
};


export type MutationDeleteExpenseArgs = {
  input: DeleteExpenseInput;
};


export type MutationDeleteExpenseManyArgs = {
  input: DeleteExpenseManyInput;
};


export type MutationUpdateBudgetArgs = {
  input: UpdateBudgetInput;
};


export type MutationUpdateExpenseArgs = {
  input: UpdateExpenseInput;
};

export type Query = {
  __typename?: 'Query';
  budgetByCode?: Maybe<Budget>;
  budgetTransactionById?: Maybe<BudgetTransaction>;
  budgetTransactions: Array<BudgetTransaction>;
  budgets: Array<Budget>;
  excerptReport: ExcerptReport;
};


export type QueryBudgetByCodeArgs = {
  input: GetBudgetByCodeInput;
};


export type QueryBudgetTransactionByIdArgs = {
  input: GetBudgetTransactionByIdInput;
};


export type QueryBudgetTransactionsArgs = {
  input: GetBudgetTransactionsInput;
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type UpdateBudgetInput = {
  amount: Scalars['Money']['input'];
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

export type UpdateExpenseInput = {
  amount: Scalars['Money']['input'];
  budgetCode: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type UpdateExpensePayload = {
  __typename?: 'UpdateExpensePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<BudgetTransaction>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type GetExcerptReportQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExcerptReportQuery = { __typename?: 'Query', excerptReport: { __typename?: 'ExcerptReport', budget: number, expense: number, balance: number } };

export type GetBudgetsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBudgetsQuery = { __typename?: 'Query', budgets: Array<{ __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string }> };

export type GetBudgetByCodeQueryVariables = Exact<{
  input: GetBudgetByCodeInput;
}>;


export type GetBudgetByCodeQuery = { __typename?: 'Query', budgetByCode?: { __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string } | null };

export type NewBudgetFragment = { __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'NewBudgetFragment' };

export type CreateBudgetMutationVariables = Exact<{
  input: CreateBudgetInput;
}>;


export type CreateBudgetMutation = { __typename?: 'Mutation', createBudget: { __typename?: 'CreateBudgetPayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string } | null } };

export type UpdateBudgetMutationVariables = Exact<{
  input: UpdateBudgetInput;
}>;


export type UpdateBudgetMutation = { __typename?: 'Mutation', updateBudget: { __typename?: 'UpdateBudgetPayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string } | null } };

export type DeleteBudgetMutationVariables = Exact<{
  input: DeleteBudgetInput;
}>;


export type DeleteBudgetMutation = { __typename?: 'Mutation', deleteBudget: { __typename?: 'DeleteBudgetPayload', code: number, success: boolean, message: string, budget?: { __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string } | null } };

export type DeleteBudgetManyMutationVariables = Exact<{
  input: DeleteBudgetManyInput;
}>;


export type DeleteBudgetManyMutation = { __typename?: 'Mutation', deleteBudgetMany: { __typename?: 'DeleteBudgetManyPayload', code: number, success: boolean, message: string, budgets?: Array<{ __typename?: 'Budget', code: string, name: string, description?: string | null, amount: number, expense: number, balance: number, createdAt: string, updatedAt: string }> | null } };

export type NewBudgetTransactionFragment = { __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'NewBudgetTransactionFragment' };

export type GetBudgetTransactionsQueryVariables = Exact<{
  input: GetBudgetTransactionsInput;
}>;


export type GetBudgetTransactionsQuery = { __typename?: 'Query', budgetTransactions: Array<{ __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string }> };

export type GetBudgetTransactionByIdQueryVariables = Exact<{
  input: GetBudgetTransactionByIdInput;
}>;


export type GetBudgetTransactionByIdQuery = { __typename?: 'Query', budgetTransactionById?: { __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string } | null };

export type CreateExpenseMutationVariables = Exact<{
  input: CreateExpenseInput;
}>;


export type CreateExpenseMutation = { __typename?: 'Mutation', createExpense: { __typename?: 'CreateExpensePayload', code: number, success: boolean, message: string, expense?: { __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string } | null } };

export type UpdateExpenseMutationVariables = Exact<{
  input: UpdateExpenseInput;
}>;


export type UpdateExpenseMutation = { __typename?: 'Mutation', updateExpense: { __typename?: 'UpdateExpensePayload', code: number, success: boolean, message: string, expense?: { __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string } | null } };

export type DeleteExpenseMutationVariables = Exact<{
  input: DeleteExpenseInput;
}>;


export type DeleteExpenseMutation = { __typename?: 'Mutation', deleteExpense: { __typename?: 'DeleteExpensePayload', code: number, success: boolean, message: string, expense?: { __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string } | null } };

export type DeleteExpenseManyMutationVariables = Exact<{
  input: DeleteExpenseManyInput;
}>;


export type DeleteExpenseManyMutation = { __typename?: 'Mutation', deleteExpenseMany: { __typename?: 'DeleteExpenseManyPayload', code: number, success: boolean, message: string, expenses?: Array<{ __typename?: 'BudgetTransaction', id: string, budgetCode: string, budgetName: string, description: string, amount: number, balance: number, transactionType: string, createdAt: string, updatedAt: string }> | null } };

export const NewBudgetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewBudget"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Budget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<NewBudgetFragment, unknown>;
export const NewBudgetTransactionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NewBudgetTransaction"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetTransaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<NewBudgetTransactionFragment, unknown>;
export const GetExcerptReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExcerptReport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"excerptReport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budget"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<GetExcerptReportQuery, GetExcerptReportQueryVariables>;
export const GetBudgetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetBudgetsQuery, GetBudgetsQueryVariables>;
export const GetBudgetByCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgetByCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetBudgetByCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgetByCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetBudgetByCodeQuery, GetBudgetByCodeQueryVariables>;
export const CreateBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CreateBudgetMutation, CreateBudgetMutationVariables>;
export const UpdateBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateBudgetMutation, UpdateBudgetMutationVariables>;
export const DeleteBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteBudgetMutation, DeleteBudgetMutationVariables>;
export const DeleteBudgetManyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteBudgetMany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteBudgetManyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteBudgetMany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"budgets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteBudgetManyMutation, DeleteBudgetManyMutationVariables>;
export const GetBudgetTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgetTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetBudgetTransactionsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgetTransactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetBudgetTransactionsQuery, GetBudgetTransactionsQueryVariables>;
export const GetBudgetTransactionByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgetTransactionById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetBudgetTransactionByIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgetTransactionById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetBudgetTransactionByIdQuery, GetBudgetTransactionByIdQueryVariables>;
export const CreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"expense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const UpdateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"expense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateExpenseMutation, UpdateExpenseMutationVariables>;
export const DeleteExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"expense"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const DeleteExpenseManyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteExpenseMany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteExpenseManyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpenseMany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetCode"}},{"kind":"Field","name":{"kind":"Name","value":"budgetName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DeleteExpenseManyMutation, DeleteExpenseManyMutationVariables>;