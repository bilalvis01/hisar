import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
  Money: { input: bigint; output: bigint; }
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

export type CreateExpenseInput = {
  amount: Scalars['Money']['input'];
  budgetCode: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type DeleteBudgetInput = {
  code: Scalars['String']['input'];
};

export type DeleteBudgetManyInput = {
  codes: Array<Scalars['String']['input']>;
};

export type DeleteExpenseInput = {
  id: Scalars['String']['input'];
};

export type DeleteExpenseManyInput = {
  ids: Array<Scalars['String']['input']>;
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
  createBudget: Budget;
  createExpense: BudgetTransaction;
  deleteBudget: Budget;
  deleteBudgetMany: Array<Budget>;
  deleteExpense: BudgetTransaction;
  deleteExpenseMany: Array<BudgetTransaction>;
  updateBudget: Budget;
  updateExpense: BudgetTransaction;
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
  budgetByCode: Budget;
  budgetTransactionById: BudgetTransaction;
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
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateExpenseInput = {
  amount: Scalars['Money']['input'];
  budgetCode: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Budget: ResolverTypeWrapper<Budget>;
  BudgetTransaction: ResolverTypeWrapper<BudgetTransaction>;
  CreateBudgetInput: CreateBudgetInput;
  CreateExpenseInput: CreateExpenseInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetManyInput: DeleteBudgetManyInput;
  DeleteExpenseInput: DeleteExpenseInput;
  DeleteExpenseManyInput: DeleteExpenseManyInput;
  ExcerptReport: ResolverTypeWrapper<ExcerptReport>;
  GetBudgetByCodeInput: GetBudgetByCodeInput;
  GetBudgetTransactionByIdInput: GetBudgetTransactionByIdInput;
  GetBudgetTransactionsInput: GetBudgetTransactionsInput;
  Money: ResolverTypeWrapper<Scalars['Money']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  SortOrder: SortOrder;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateBudgetInput: UpdateBudgetInput;
  UpdateExpenseInput: UpdateExpenseInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Budget: Budget;
  BudgetTransaction: BudgetTransaction;
  CreateBudgetInput: CreateBudgetInput;
  CreateExpenseInput: CreateExpenseInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetManyInput: DeleteBudgetManyInput;
  DeleteExpenseInput: DeleteExpenseInput;
  DeleteExpenseManyInput: DeleteExpenseManyInput;
  ExcerptReport: ExcerptReport;
  GetBudgetByCodeInput: GetBudgetByCodeInput;
  GetBudgetTransactionByIdInput: GetBudgetTransactionByIdInput;
  GetBudgetTransactionsInput: GetBudgetTransactionsInput;
  Money: Scalars['Money']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
  UpdateBudgetInput: UpdateBudgetInput;
  UpdateExpenseInput: UpdateExpenseInput;
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  amount?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expense?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetTransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetTransaction'] = ResolversParentTypes['BudgetTransaction']> = {
  amount?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  budgetCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  budgetName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transactionType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type ExcerptReportResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExcerptReport'] = ResolversParentTypes['ExcerptReport']> = {
  balance?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  budget?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  expense?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface MoneyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Money'], any> {
  name: 'Money';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createBudget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<MutationCreateBudgetArgs, 'input'>>;
  createExpense?: Resolver<ResolversTypes['BudgetTransaction'], ParentType, ContextType, RequireFields<MutationCreateExpenseArgs, 'input'>>;
  deleteBudget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<MutationDeleteBudgetArgs, 'input'>>;
  deleteBudgetMany?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, RequireFields<MutationDeleteBudgetManyArgs, 'input'>>;
  deleteExpense?: Resolver<ResolversTypes['BudgetTransaction'], ParentType, ContextType, RequireFields<MutationDeleteExpenseArgs, 'input'>>;
  deleteExpenseMany?: Resolver<Array<ResolversTypes['BudgetTransaction']>, ParentType, ContextType, RequireFields<MutationDeleteExpenseManyArgs, 'input'>>;
  updateBudget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<MutationUpdateBudgetArgs, 'input'>>;
  updateExpense?: Resolver<ResolversTypes['BudgetTransaction'], ParentType, ContextType, RequireFields<MutationUpdateExpenseArgs, 'input'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budgetByCode?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetByCodeArgs, 'input'>>;
  budgetTransactionById?: Resolver<ResolversTypes['BudgetTransaction'], ParentType, ContextType, RequireFields<QueryBudgetTransactionByIdArgs, 'input'>>;
  budgetTransactions?: Resolver<Array<ResolversTypes['BudgetTransaction']>, ParentType, ContextType, RequireFields<QueryBudgetTransactionsArgs, 'input'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  excerptReport?: Resolver<ResolversTypes['ExcerptReport'], ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>;
  BudgetTransaction?: BudgetTransactionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  ExcerptReport?: ExcerptReportResolvers<ContextType>;
  Money?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

