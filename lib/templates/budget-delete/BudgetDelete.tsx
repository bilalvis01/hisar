"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET } from "../../graphql/documents";
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
            if (deleteBudget.code === 200) {
                cache.modify({
                    fields: {
                        budgets(existingBudgetRefs, { readField }) {
                            return existingBudgetRefs.filter(
                                budgetRef => budget.code !== readField("code", budgetRef)
                            );
                        },
                        budgetByCode(_, { DELETE }) {
                            return DELETE;
                        },
                    }
                });
            }
        },
        onCompleted(data) {
            console.error(data.deleteBudget.message);
            setInfo(data.deleteBudget.message);
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