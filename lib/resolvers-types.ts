import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './graphql-context';
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
  balance: Scalars['Money']['input'];
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
  BudgetByCodePayload: ResolverTypeWrapper<BudgetByCodePayload>;
  BudgetLedgerEntry: ResolverTypeWrapper<BudgetLedgerEntry>;
  CreateBudgetInput: CreateBudgetInput;
  CreateBudgetPayload: ResolverTypeWrapper<CreateBudgetPayload>;
  CreateExpenseInput: CreateExpenseInput;
  CreateExpensePayload: ResolverTypeWrapper<CreateExpensePayload>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetManyInput: DeleteBudgetManyInput;
  DeleteBudgetManyPayload: ResolverTypeWrapper<DeleteBudgetManyPayload>;
  DeleteBudgetPayload: ResolverTypeWrapper<DeleteBudgetPayload>;
  ExcerptReport: ResolverTypeWrapper<ExcerptReport>;
  Expense: ResolverTypeWrapper<Expense>;
  ExpenseByCodePayload: ResolverTypeWrapper<ExpenseByCodePayload>;
  GetBudgetInput: GetBudgetInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Money: ResolverTypeWrapper<Scalars['Money']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
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
  BudgetByCodePayload: BudgetByCodePayload;
  BudgetLedgerEntry: BudgetLedgerEntry;
  CreateBudgetInput: CreateBudgetInput;
  CreateBudgetPayload: CreateBudgetPayload;
  CreateExpenseInput: CreateExpenseInput;
  CreateExpensePayload: CreateExpensePayload;
  DateTime: Scalars['DateTime']['output'];
  DeleteBudgetInput: DeleteBudgetInput;
  DeleteBudgetManyInput: DeleteBudgetManyInput;
  DeleteBudgetManyPayload: DeleteBudgetManyPayload;
  DeleteBudgetPayload: DeleteBudgetPayload;
  ExcerptReport: ExcerptReport;
  Expense: Expense;
  ExpenseByCodePayload: ExpenseByCodePayload;
  GetBudgetInput: GetBudgetInput;
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
  balance?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  budget?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  expense?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ledgerEntries?: Resolver<Array<ResolversTypes['BudgetLedgerEntry']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetByCodePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetByCodePayload'] = ResolversParentTypes['BudgetByCodePayload']> = {
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetLedgerEntryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetLedgerEntry'] = ResolversParentTypes['BudgetLedgerEntry']> = {
  balance?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  credit?: Resolver<Maybe<ResolversTypes['Money']>, ParentType, ContextType>;
  debit?: Resolver<Maybe<ResolversTypes['Money']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  expense?: Resolver<Maybe<ResolversTypes['Expense']>, ParentType, ContextType>;
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

export type ExcerptReportResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExcerptReport'] = ResolversParentTypes['ExcerptReport']> = {
  balance?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  budget?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  expense?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExpenseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Expense'] = ResolversParentTypes['Expense']> = {
  amount?: Resolver<ResolversTypes['Money'], ParentType, ContextType>;
  budgetAccount?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  budgetAccountId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExpenseByCodePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExpenseByCodePayload'] = ResolversParentTypes['ExpenseByCodePayload']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['Expense']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  updateBudget?: Resolver<ResolversTypes['UpdateBudgetPayload'], ParentType, ContextType, RequireFields<MutationUpdateBudgetArgs, 'input'>>;
  updateExpense?: Resolver<ResolversTypes['UpdateExpensePayload'], ParentType, ContextType, RequireFields<MutationUpdateExpenseArgs, 'input'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budgetByCode?: Resolver<ResolversTypes['BudgetByCodePayload'], ParentType, ContextType, RequireFields<QueryBudgetByCodeArgs, 'code'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType, Partial<QueryBudgetsArgs>>;
  excerptReport?: Resolver<ResolversTypes['ExcerptReport'], ParentType, ContextType>;
  expenseByCode?: Resolver<ResolversTypes['ExpenseByCodePayload'], ParentType, ContextType, RequireFields<QueryExpenseByCodeArgs, 'code'>>;
  expenses?: Resolver<Array<ResolversTypes['Expense']>, ParentType, ContextType>;
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
  expense?: Resolver<Maybe<ResolversTypes['Expense']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Budget?: BudgetResolvers<ContextType>;
  BudgetByCodePayload?: BudgetByCodePayloadResolvers<ContextType>;
  BudgetLedgerEntry?: BudgetLedgerEntryResolvers<ContextType>;
  CreateBudgetPayload?: CreateBudgetPayloadResolvers<ContextType>;
  CreateExpensePayload?: CreateExpensePayloadResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteBudgetManyPayload?: DeleteBudgetManyPayloadResolvers<ContextType>;
  DeleteBudgetPayload?: DeleteBudgetPayloadResolvers<ContextType>;
  ExcerptReport?: ExcerptReportResolvers<ContextType>;
  Expense?: ExpenseResolvers<ContextType>;
  ExpenseByCodePayload?: ExpenseByCodePayloadResolvers<ContextType>;
  Money?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UpdateBudgetPayload?: UpdateBudgetPayloadResolvers<ContextType>;
  UpdateExpensePayload?: UpdateExpensePayloadResolvers<ContextType>;
};

