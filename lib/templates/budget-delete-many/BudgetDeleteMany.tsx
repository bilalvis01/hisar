"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET_MANY } from "../../graphql/budget-documents";
import { useMutation } from "@apollo/client";
import { DeleteBudgetManyMutation, Budget } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createInfo from "../../utils/createInfo";

interface BudgetDeleteManyProps {
    budgets: Budget[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: DeleteBudgetManyMutation) => void;
}

export default function BudgetDeleteMany({
    budgets,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: BudgetDeleteManyProps) {
    const { setInfo } = useTemplateContext();
    const codes = budgets.map((budget) => budget.code);
    const budgetNames = budgets.map((budget) => budget.name);

    const [deleteBudgetMany] = useMutation(DELETE_BUDGET_MANY, {
        update(cache, { data: { deleteBudgetMany } }) {
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

            deleteBudgetMany.budgets.forEach((budget) => {
                cache.evict({
                    id: cache.identify(budget),
                });
            });
        },
        onCompleted(data) {
            setInfo(data.deleteBudgetMany.message);
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