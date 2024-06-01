"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_EXPENSE_MANY } from "../../graphql/expense-documents";
import { useMutation } from "@apollo/client";
import { DeleteExpenseManyMutation, BudgetTransaction } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createInfo from "../../utils/createInfo";
import { GET_BUDGETS } from "../../graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";

interface ExpenseDeleteManyProps {
    expenses: BudgetTransaction[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: DeleteExpenseManyMutation) => void;
}

export default function ExpenseDeleteMany({
    expenses,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: ExpenseDeleteManyProps) {
    const { setInfo } = useTemplateContext();
    const ids = expenses.map(expense => expense.id);
    const descriptions = expenses.map(expense => expense.description);

    const [deleteBudget] = useMutation(DELETE_EXPENSE_MANY, {
        refetchQueries: [
            { query: GET_BUDGETS },
            { query: GET_BUDGET_TRANSACTIONS },
        ],
        update(cache, { data: { deleteExpenseMany } }) {
            deleteExpenseMany.expenses.forEach((expense) => {
                cache.evict({
                    id: cache.identify(expense)
                });
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onCompleted(data) {
            setInfo(data.deleteExpenseMany.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const data = {
        values: { ids },
        headline: "Hapus Expense?",
        supportingText: createInfo(descriptions, "Apakah anda ingin menghapus ", " ?"),
    };

    return (
        <DeleteDialog 
            data={data}
            open={open}
            onOpenChange={setOpen}
            onSubmit={async (input) => {
                await deleteBudget({
                    variables: { input }
                })
            }}
        />
    );
}