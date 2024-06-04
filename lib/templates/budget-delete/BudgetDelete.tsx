"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET, GET_EXCERPT_REPORT } from "../../graphql/budget-documents";
import { useMutation } from "@apollo/client";
import { DeleteBudgetMutation, Budget } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createInfo from "../../utils/createInfo";

interface BudgetDeleteProps {
    budgets: Budget[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: DeleteBudgetMutation) => void;
}

export default function BudgetDelete({
    budgets,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: BudgetDeleteProps) {
    const { setInfo } = useTemplateContext();
    const codes = budgets.map((budget) => budget.code);
    const budgetNames = budgets.map((budget) => budget.name);

    const [deleteBudgetMany] = useMutation(DELETE_BUDGET, {
        refetchQueries: [
            { query: GET_EXCERPT_REPORT },
        ],
        update(cache, { data: { deleteBudget } }) {
            cache.modify({
                fields: {
                    budgetTransactions(existingBudgetTransactionRefs = [], { readField }) {
                        const removedBudgetTransactions = existingBudgetTransactionRefs.filter(
                            budgetTransactionRef => codes.includes(readField("budgetCode", budgetTransactionRef))
                        );

                        removedBudgetTransactions.forEach((budgetTransaction) => {
                            cache.evict({
                                id: cache.identify(budgetTransaction)
                            })
                        });
                    },
                }
            });

            deleteBudget.forEach((budget) => {
                cache.evict({
                    id: cache.identify(budget),
                });
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onError() {
            setInfo(createInfo(budgetNames, "gagal menghapus "));
        },
        onCompleted(data) {
            setInfo(createInfo(budgetNames, "berhasil menghapus "));
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const data = {
        values: { codes },
        headline: "Hapus Budget?",
        supportingText: createInfo(budgetNames, "Apakah anda ingin menghapus ", " ?"),
    };

    return (
        <DeleteDialog 
            data={data}
            open={open}
            onOpenChange={setOpen}
            onSubmit={async (input) => {
                await deleteBudgetMany({
                    variables: { input }
                });
            }}
        />
    );
}