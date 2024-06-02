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
  CreateBudgetPayload: ResolverTypeWrapper<CreateBudgetPayload>;
  CreateExpenseInput: CreateExpenseInput;
  CreateExpensePayload: ResolverTypeWrapper<CreateExpensePayload>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetManyInput: DeleteBudgetManyInput;
  DeleteBudgetManyPayload: ResolverTypeWrapper<DeleteBudgetManyPayload>;
  DeleteBudgetPayload: ResolverTypeWrapper<DeleteBudgetPayload>;
  DeleteExpenseInput: DeleteExpenseInput;
  DeleteExpenseManyInput: DeleteExpenseManyInput;
  DeleteExpenseManyPayload: ResolverTypeWrapper<DeleteExpenseManyPayload>;
  DeleteExpensePayload: ResolverTypeWrapper<DeleteExpensePayload>;
  ExcerptReport: ResolverTypeWrapper<ExcerptReport>;
  GetBudgetByCodeInput: GetBudgetByCodeInput;
  GetBudgetTransactionByIdInput: GetBudgetTransactionByIdInput;
  GetBudgetTransactionsInput: GetBudgetTransactionsInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Money: ResolverTypeWrapper<Scalars['Money']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  SortOrder: SortOrder;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateBudgetInput: UpdateBudgetInput;
  UpdateBudgetPayload: ResolverTypeWrapper<UpdateBudgetPayload>;
  UpdateExpenseInput: UpdateExpenseInput;
  UpdateExpensePayload: ResolverTypeWrapper<UpdateExpensePayload>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Budget: Budget;
  BudgetTransaction: BudgetTransaction;
  CreateBudgetInput: CreateBudgetInput;
  CreateBudgetPayload: CreateBudgetPayload;
  CreateExpenseInput: CreateExpenseInput;
  CreateExpensePayload: CreateExpensePayload;
  DateTime: Scalars['DateTime']['output'];
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetManyInput: DeleteBudgetManyInput;
  DeleteBudgetManyPayload: DeleteBudgetManyPayload;
  DeleteBudgetPayload: DeleteBudgetPayload;
  DeleteExpenseInput: DeleteExpenseInput;
  DeleteExpenseManyInput: DeleteExpenseManyInput;
  DeleteExpenseManyPayload: DeleteExpenseManyPayload;
  DeleteExpensePayload: DeleteExpensePayload;
  ExcerptReport: ExcerptReport;
  GetBudgetByCodeInput: GetBudgetByCodeInput;
  GetBudgetTransactionByIdInput: GetBudgetTransactionByIdInput;
  GetBudgetTransactionsInput: GetBudgetTransactionsInput;
  Int: Scalars['Int']['output'];
  Money: Scalars['Money']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
  UpdateBudgetInput: UpdateBudgetInput;
  UpdateBudgetPayload: UpdateBudgetPayload;
  UpdateExpenseInput: UpdateExpenseInput;
  UpdateExpensePayload: UpdateExpensePayload;
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

export type CreateBudgetPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateBudgetPayload'] = ResolversParentTypes['CreateBudgetPayload']> = {
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateExpensePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateExpensePayload'] = ResolversParentTypes['CreateExpensePayload']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['BudgetTransaction']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteBudgetManyPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteBudgetManyPayload'] = ResolversParentTypes['DeleteBudgetManyPayload']> = {
  budgets?: Resolver<Maybe<Array<ResolversTypes['Budget']>>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteBudgetPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteBudgetPayload'] = ResolversParentTypes['DeleteBudgetPayload']> = {
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteExpenseManyPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteExpenseManyPayload'] = ResolversParentTypes['DeleteExpenseManyPayload']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expenses?: Resolver<Maybe<Array<ResolversTypes['BudgetTransaction']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteExpensePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteExpensePayload'] = ResolversParentTypes['DeleteExpensePayload']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['BudgetTransaction']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

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
  createBudget?: Resolver<ResolversTypes['CreateBudgetPayload'], ParentType, ContextType, RequireFields<MutationCreateBudgetArgs, 'input'>>;
  createExpense?: Resolver<ResolversTypes['CreateExpensePayload'], ParentType, ContextType, RequireFields<MutationCreateExpenseArgs, 'input'>>;
  deleteBudget?: Resolver<ResolversTypes['DeleteBudgetPayload'], ParentType, ContextType, RequireFields<MutationDeleteBudgetArgs, 'input'>>;
  deleteBudgetMany?: Resolver<ResolversTypes['DeleteBudgetManyPayload'], ParentType, ContextType, RequireFields<MutationDeleteBudgetManyArgs, 'input'>>;
  deleteExpense?: Resolver<ResolversTypes['DeleteExpensePayload'], ParentType, ContextType, RequireFields<MutationDeleteExpenseArgs, 'input'>>;
  deleteExpenseMany?: Resolver<ResolversTypes['DeleteExpenseManyPayload'], ParentType, ContextType, RequireFields<MutationDeleteExpenseManyArgs, 'input'>>;
  updateBudget?: Resolver<ResolversTypes['UpdateBudgetPayload'], ParentType, ContextType, RequireFields<MutationUpdateBudgetArgs, 'input'>>;
  updateExpense?: Resolver<ResolversTypes['UpdateExpensePayload'], ParentType, ContextType, RequireFields<MutationUpdateExpenseArgs, 'input'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budgetByCode?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetByCodeArgs, 'input'>>;
  budgetTransactionById?: Resolver<ResolversTypes['BudgetTransaction'], ParentType, ContextType, RequireFields<QueryBudgetTransactionByIdArgs, 'input'>>;
  budgetTransactions?: Resolver<Array<ResolversTypes['BudgetTransaction']>, ParentType, ContextType, RequireFields<QueryBudgetTransactionsArgs, 'input'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  excerptReport?: Resolver<ResolversTypes['ExcerptReport'], ParentType, ContextType>;
};

export type UpdateBudgetPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateBudgetPayload'] = ResolversParentTypes['UpdateBudgetPayload']> = {
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateExpensePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateExpensePayload'] = ResolversParentTypes['UpdateExpensePayload']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['BudgetTransaction']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>;
  BudgetTransaction?: BudgetTransactionResolvers<ContextType>;
  CreateBudgetPayload?: CreateBudgetPayloadResolvers<ContextType>;
  CreateExpensePayload?: CreateExpensePayloadResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteBudgetManyPayload?: DeleteBudgetManyPayloadResolvers<ContextType>;
  DeleteBudgetPayload?: DeleteBudgetPayloadResolvers<ContextType>;
  DeleteExpenseManyPayload?: DeleteExpenseManyPayloadResolvers<ContextType>;
  DeleteExpensePayload?: DeleteExpensePayloadResolvers<ContextType>;
  ExcerptReport?: ExcerptReportResolvers<ContextType>;
  Money?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UpdateBudgetPayload?: UpdateBudgetPayloadResolvers<ContextType>;
  UpdateExpensePayload?: UpdateExpensePayloadResolvers<ContextType>;
};

