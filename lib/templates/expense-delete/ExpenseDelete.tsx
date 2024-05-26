"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_EXPENSE } from "../../graphql/documents";
import { useMutation } from "@apollo/client";
import { DeleteExpenseMutation, Expense } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";

interface ExpenseDeleteProps {
    expense: Expense;
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
        update(cache) {
            cache.modify({
                fields: {
                    expenses(existingExpenseRefs, { readField }) {
                        return existingExpenseRefs.filter(
                            expenseRef => expense.id !== readField("id", expenseRef)
                        );
                    },
                    expenseById(_, { DELETE }) {
                        return DELETE;
                    },
                }
            });
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