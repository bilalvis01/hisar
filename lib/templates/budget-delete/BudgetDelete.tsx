"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET, GET_BUDGET_BY_CODE } from "../../graphql-documents";
import { useMutation, useLazyQuery } from "@apollo/client";
import { DeleteBudgetMutation, Budget } from "../../graphql-tag/graphql";
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

    const [getBudgetByCode, { data: getBudgetByCodeData }] = useLazyQuery(GET_BUDGET_BY_CODE);

    const [deleteBudget] = useMutation(DELETE_BUDGET, {
        update(cache) {
            cache.modify({
                fields: {
                    budgets(existingBudgetRefs, { readField }) {
                        return existingBudgetRefs.filter(
                            budgetRef => budget.id !== readField("id", budgetRef)
                        );
                    },
                    budgetByCode(_, { DELETE }) {
                        return DELETE;
                    },
                }
            });
        },
        onCompleted(data) {
            setInfo(data.deleteBudget.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const data = {
        values: { id: budget.id },
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