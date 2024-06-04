"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_EXPENSE } from "../../graphql/expense-documents";
import { useMutation } from "@apollo/client";
import { DeleteExpenseMutation, BudgetTransaction } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createInfo from "../../utils/createInfo";
import { GET_BUDGET_BY_CODE, GET_EXCERPT_REPORT } from "../../graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";

interface ExpenseDeleteProps {
    expenses: BudgetTransaction[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: DeleteExpenseMutation) => void;
}

export default function ExpenseDelete({
    expenses,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: ExpenseDeleteProps) {
    const { setInfo } = useTemplateContext();
    const ids = expenses.map(expense => expense.id);
    const descriptions = expenses.map(expense => expense.description);

    const [deleteExpenseMany] = useMutation(DELETE_EXPENSE, {
        refetchQueries(result) {
            const deletedExpenses = result.data && result.data.deleteExpense
                ? result.data.deleteExpense
                : [];

            const budgetCodes = deletedExpenses.reduce<string[]>((acc, deletedExpense) => {
                if (!acc.includes(deletedExpense.budgetCode)) {
                    acc.push(deletedExpense.budgetCode);
                }

                return acc;
            }, []);

            const getBudgetByCodeQueryList = budgetCodes.map((budgetCode) => {
                return {
                    query: GET_BUDGET_BY_CODE,
                    variables: { input: { code: budgetCode } }
                };
            });

            const getBudgetTransactionsQueryList = budgetCodes.map((budgetCode) => {
                return {
                    query: GET_BUDGET_TRANSACTIONS,
                    variables: { input: { budgetCode } }
                };
            })

            return [
                ...getBudgetByCodeQueryList,
                ...getBudgetTransactionsQueryList,
                { query: GET_EXCERPT_REPORT },
            ];
        },
        update(cache, { data: { deleteExpense } }) {
            deleteExpense.forEach((expense) => {
                cache.evict({
                    id: cache.identify(expense)
                });
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onError() {
            setInfo(createInfo(descriptions, "gagal menghapus "));
        },
        onCompleted(data) {
            setInfo(createInfo(descriptions, "berhasil menghapus "));
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
                await deleteExpenseMany({
                    variables: { input }
                })
            }}
        />
    );
}