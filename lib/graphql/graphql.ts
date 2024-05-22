/* eslint-disable */
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
  balance: Scalars['Money']['output'];
  budget: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expense: Scalars['Money']['output'];
  id: Scalars['Int']['output'];
  ledgerEntries: Array<BudgetLedgerEntry>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  balance: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  credit?: Maybe<Scalars['Money']['output']>;
  debit?: Maybe<Scalars['Money']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateBudgetInput = {
  budget: Scalars['Money']['input'];
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
  budgetAccountId: Scalars['Int']['input'];
  description: Scalars['String']['input'];
};

export type CreateExpensePayload = {
  __typename?: 'CreateExpensePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<Expense>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteBudgetInput = {
  id: Scalars['Int']['input'];
};

export type DeleteBudgetManyInput = {
  ids: Array<Scalars['Int']['input']>;
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

export type ExcerptReport = {
  __typename?: 'ExcerptReport';
  balance: Scalars['Money']['output'];
  budget: Scalars['Money']['output'];
  expense: Scalars['Money']['output'];
};

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['Money']['output'];
  budgetAccount: Scalars['String']['output'];
  budgetAccountId: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ExpenseByCodePayload = {
  __typename?: 'ExpenseByCodePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<Expense>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type GetBudgetInput = {
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createBudget: CreateBudgetPayload;
  createExpense: CreateExpensePayload;
  deleteBudget: DeleteBudgetPayload;
  deleteBudgetMany: DeleteBudgetManyPayload;
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


export type MutationUpdateBudgetArgs = {
  input: UpdateBudgetInput;
};


export type MutationUpdateExpenseArgs = {
  input: UpdateExpenseInput;
};

export type Query = {
  __typename?: 'Query';
  budgetByCode: BudgetByCodePayload;
  budgets: Array<Budget>;
  excerptReport: ExcerptReport;
  expenseByCode: ExpenseByCodePayload;
  expenses: Array<Expense>;
};


export type QueryBudgetByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryBudgetsArgs = {
  input?: InputMaybe<GetBudgetInput>;
};


export type QueryExpenseByCodeArgs = {
  code: Scalars['String']['input'];
};

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
  budgetAccountId: Scalars['Int']['input'];
  code: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type UpdateExpensePayload = {
  __typename?: 'UpdateExpensePayload';
  code: Scalars['Int']['output'];
  expense?: Maybe<Expense>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};
