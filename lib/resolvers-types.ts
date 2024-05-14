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
  expenseDetail: Array<BudgetExpenses>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeIso']['output'];
};

export type BudgetExpenses = {
  __typename?: 'BudgetExpenses';
  balance: Scalars['Int']['output'];
  credit?: Maybe<Scalars['Int']['output']>;
  debit?: Maybe<Scalars['Int']['output']>;
  description: Scalars['String']['output'];
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
  updateBudget: UpdateBudgetPayload;
};


export type MutationAddExpenseArgs = {
  input: AddExpenseInput;
};


export type MutationCreateBudgetArgs = {
  input: CreateBudgetInput;
};


export type MutationUpdateBudgetArgs = {
  input: UpdateBudgetInput;
};

export type Query = {
  __typename?: 'Query';
  budgetByCode: Budget;
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
  AddExpenseInput: AddExpenseInput;
  AddExpensePayload: ResolverTypeWrapper<AddExpensePayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Budget: ResolverTypeWrapper<Budget>;
  BudgetExpenses: ResolverTypeWrapper<BudgetExpenses>;
  CreateBudgetInput: CreateBudgetInput;
  CreateBudgetPayload: ResolverTypeWrapper<CreateBudgetPayload>;
  DateTimeIso: ResolverTypeWrapper<Scalars['DateTimeIso']['output']>;
  ExcerptReport: ResolverTypeWrapper<ExcerptReport>;
  Expense: ResolverTypeWrapper<Expense>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateBudgetInput: UpdateBudgetInput;
  UpdateBudgetPayload: ResolverTypeWrapper<UpdateBudgetPayload>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddExpenseInput: AddExpenseInput;
  AddExpensePayload: AddExpensePayload;
  Boolean: Scalars['Boolean']['output'];
  Budget: Budget;
  BudgetExpenses: BudgetExpenses;
  CreateBudgetInput: CreateBudgetInput;
  CreateBudgetPayload: CreateBudgetPayload;
  DateTimeIso: Scalars['DateTimeIso']['output'];
  ExcerptReport: ExcerptReport;
  Expense: Expense;
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
  UpdateBudgetInput: UpdateBudgetInput;
  UpdateBudgetPayload: UpdateBudgetPayload;
};

export type AddExpensePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddExpensePayload'] = ResolversParentTypes['AddExpensePayload']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expense?: Resolver<Maybe<ResolversTypes['Expense']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  balance?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  budget?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTimeIso'], ParentType, ContextType>;
  expense?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expenseDetail?: Resolver<Array<ResolversTypes['BudgetExpenses']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTimeIso'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetExpensesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetExpenses'] = ResolversParentTypes['BudgetExpenses']> = {
  balance?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  credit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  debit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateBudgetPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateBudgetPayload'] = ResolversParentTypes['CreateBudgetPayload']> = {
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeIsoScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTimeIso'], any> {
  name: 'DateTimeIso';
}

export type ExcerptReportResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExcerptReport'] = ResolversParentTypes['ExcerptReport']> = {
  balance?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  budget?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expense?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExpenseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Expense'] = ResolversParentTypes['Expense']> = {
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  budgetAccount?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  budgetAccountId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTimeIso'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTimeIso'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addExpense?: Resolver<ResolversTypes['AddExpensePayload'], ParentType, ContextType, RequireFields<MutationAddExpenseArgs, 'input'>>;
  createBudget?: Resolver<ResolversTypes['CreateBudgetPayload'], ParentType, ContextType, RequireFields<MutationCreateBudgetArgs, 'input'>>;
  updateBudget?: Resolver<ResolversTypes['UpdateBudgetPayload'], ParentType, ContextType, RequireFields<MutationUpdateBudgetArgs, 'input'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  budgetByCode?: Resolver<ResolversTypes['Budget'], ParentType, ContextType, RequireFields<QueryBudgetByCodeArgs, 'code'>>;
  budgets?: Resolver<Array<ResolversTypes['Budget']>, ParentType, ContextType>;
  excerptReport?: Resolver<ResolversTypes['ExcerptReport'], ParentType, ContextType>;
  expenses?: Resolver<Array<ResolversTypes['Expense']>, ParentType, ContextType>;
};

export type UpdateBudgetPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateBudgetPayload'] = ResolversParentTypes['UpdateBudgetPayload']> = {
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  AddExpensePayload?: AddExpensePayloadResolvers<ContextType>;
  Budget?: BudgetResolvers<ContextType>;
  BudgetExpenses?: BudgetExpensesResolvers<ContextType>;
  CreateBudgetPayload?: CreateBudgetPayloadResolvers<ContextType>;
  DateTimeIso?: GraphQLScalarType;
  ExcerptReport?: ExcerptReportResolvers<ContextType>;
  Expense?: ExpenseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UpdateBudgetPayload?: UpdateBudgetPayloadResolvers<ContextType>;
};

