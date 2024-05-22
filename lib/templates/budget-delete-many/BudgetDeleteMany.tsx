"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET_MANY } from "../../graphql/documents";
import { useMutation } from "@apollo/client";
import { DeleteBudgetManyMutation, Budget } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createMessageBudgetDelete from "../../utils/createMessageBudgetDelete";

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
    const ids = budgets.map((budget) => budget.id);

    const [deleteBudgetMany] = useMutation(DELETE_BUDGET_MANY, {
        update(cache) {
            cache.modify({
                fields: {
                    budgets(existingBudgetRefs, { readField }) {
                        return existingBudgetRefs.filter(
                            budgetRef => !ids.includes(readField("id", budgetRef))
                        );
                    },
                }
            });
        },
        onCompleted(data) {
            setInfo(data.deleteBudgetMany.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const data = {
        values: { ids: ids },
        headline: "Hapus Budget?",
        supportingText: createMessageBudgetDelete(budgets, "Apakah anda ingin menghapus ", " ?"),
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