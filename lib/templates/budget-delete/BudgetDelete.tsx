"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET } from "../../graphql-documents";
import { useMutation } from "@apollo/client";
import { DeleteBudgetMutation, Budget } from "../../graphql-tag/graphql";
import { ALL } from "dns";

interface BudgetDeleteProps {
    budget: Budget;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (data: DeleteBudgetMutation) => void;
}

export default function BudgetDelete({
    budget,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: BudgetDeleteProps) {
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
            setOpen(false);
            onSuccess(data);
        },
    });

    return (
        <DeleteDialog 
            values={{ id: budget.id }}
            open={open}
            onOpenChange={setOpen}
            label="Hapus" 
            headline="Hapus Budget?" 
            supportingText={`Apakah anda ingin menghapus ${budget.name}?`}
            onSubmit={async (input) => {
                await deleteBudget({
                    variables: { input }
                })
            }}
        />
    );
}