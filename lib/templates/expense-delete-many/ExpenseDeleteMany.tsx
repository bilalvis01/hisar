"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_EXPENSE_MANY } from "../../graphql/documents";
import { useMutation } from "@apollo/client";
import { DeleteExpenseManyMutation, BudgetTransaction } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createMessageDeleteMany from "../../utils/createMessageDeleteMany";

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
        update(cache, { data: { deleteExpenseMany } }) {
            if (deleteExpenseMany.code === 200) {
                cache.modify({
                    fields: {
                        expenses(existingExpenseRefs, { readField }) {
                            return existingExpenseRefs.filter(
                                expenseRef => !ids.includes(readField("id", expenseRef))
                            );
                        },
                    }
                });
            }
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
        supportingText: createMessageDeleteMany(descriptions, "Apakah anda ingin menghapus ", " ?"),
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