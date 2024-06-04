"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET } from "../../graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";
import { useMutation, useLazyQuery } from "@apollo/client";
import { DeleteBudgetMutation, Budget } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";

interface BudgetDeleteProps {
    budget: Budget;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: DeleteBudgetMutation) => void;
}

export default function BudgetDelete({
    budget,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: BudgetDeleteProps) {
    const { setInfo } = useTemplateContext();

    const [deleteBudget] = useMutation(DELETE_BUDGET, {
        update(cache, { data: { deleteBudget } }) {
            cache.modify({
                fields: {
                    budgetTransactions(existingBudgetTransactionRefs, { readField }) {
                        const removedBudgetTransactions = existingBudgetTransactionRefs.filter(
                            budgetTransactionRef => budget.code === readField("budgetCode", budgetTransactionRef)
                        );

                        removedBudgetTransactions.forEach((budgetTransaction) => {
                            cache.evict({
                                id: cache.identify(budgetTransaction)
                            });
                        });
                    },
                }
            });
            
            cache.evict({
                id: cache.identify(deleteBudget),
            });
        },
        onError(error, { variables: { input } }) {
            setInfo(`"${budget.name}" gagal dihapus`);
        },
        onCompleted(data) {
            setInfo(`${budget.name} berhasil dihapus`);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const data = {
        values: { code: budget.code },
        headline: "Hapus Budget?",
        supportingText: `Apakah anda ingin menghapus "${budget.name}"?`,
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