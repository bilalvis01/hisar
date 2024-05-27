import { 
    Budget,
    Account,
    BudgetAccountAssignment,
    BudgetAccountTask,
} from "@prisma/client";
import { 
    BUDGET_CASH_ACCOUNT, 
    BUDGET_EXPENSE_ACCOUNT, 
} from "../database/budget-account-task";

type Param = Budget & { accountAssignments: (BudgetAccountAssignment & { account: Account, task: BudgetAccountTask })[]  };

export function getBudgetCashAccount(budget: Param) {
    return budget.accountAssignments.filter(
        (budgetAccount) => budgetAccount.task.name === BUDGET_CASH_ACCOUNT
    )[0]["account"];
};

export function getBudgetExpenseAccount(budget: Param) {
    return budget.accountAssignments.filter(
        (budgetAccount) => budgetAccount.task.name === BUDGET_EXPENSE_ACCOUNT
    )[0]["account"];
};