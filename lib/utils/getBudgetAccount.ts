import { 
    Budget,
    Account,
    BudgetAccountAssignment,
} from "@prisma/client";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT, 
} from "../database/budget-account-assignment";

type Param = Budget & { accountAssignments: (BudgetAccountAssignment & { account: Account })[]  };

export function getBudgetCashAccount(budget: Param) {
    return budget.accountAssignments.filter(
        (budgetAccount) => budgetAccount.task === BUDGET_CASH_ACCOUNT
    )[0];
};

export function getBudgetExpenseAccount(budget: Param) {
    return budget.accountAssignments.filter(
        (budgetAccount) => budgetAccount.task === BUDGET_EXPENSE_ACCOUNT
    )[0];
};