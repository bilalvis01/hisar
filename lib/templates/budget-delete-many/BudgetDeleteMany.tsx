"use client"

import React from "react";
import DeleteDialog from "../delete-dialog/DeleteDialog";
import { DELETE_BUDGET_MANY } from "../../graphql/documents";
import { useMutation } from "@apollo/client";
import { DeleteBudgetManyMutation, Budget } from "../../graphql/generated/graphql";
import { useTemplateContext } from "../Template";
import createMessageDeleteMany from "../../utils/createMessageDeleteMany";

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
            if (deleteBudgetMany.code === 200) {
                cache.modify({
                    fields: {
                        budgets(existingBudgetRefs, { readField }) {
                            return existingBudgetRefs.filter(
                                budgetRef => !codes.includes(readField("code", budgetRef))
                            );
                        },
                    }
                });
            }
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
        supportingText: createMessageDeleteMany(budgetNames, "Apakah anda ingin menghapus ", " ?"),
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