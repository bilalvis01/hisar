"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_EXPENSE } from "../../graphql/expense-documents";
import { useMutation } from "@apollo/client";
import { DeleteExpenseMutation, BudgetTransaction } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import { GET_BUDGET_BY_CODE } from "../../graphql/budget-documents";

interface ExpenseDeleteProps {
    expense: BudgetTransaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: DeleteExpenseMutation) => void;
}

export default function ExpenseDelete({
    expense,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: ExpenseDeleteProps) {
    const { setInfo } = useTemplateContext();

    const [deleteBudget] = useMutation(DELETE_EXPENSE, {
        refetchQueries(result) {
            const budgetCode = result.data && 
                result.data.deleteExpense.expense && 
                result.data.deleteExpense.expense.budgetCode;
                
            return [
                { query: GET_BUDGET_BY_CODE, variables: { input: { code: budgetCode, } } },
            ];
        },
        update(cache, { data: { deleteExpense } }) {
            cache.evict({
                id: cache.identify(deleteExpense.expense)
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onCompleted(data) {
            setInfo(data.deleteExpense.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const data = {
        values: { id: expense.id },
        headline: "Hapus Expense?",
        supportingText: `Apakah anda ingin menghapus "${expense.description}"?`,
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