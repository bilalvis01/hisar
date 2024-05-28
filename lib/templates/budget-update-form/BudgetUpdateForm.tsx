"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { UPDATE_BUDGET, NEW_BUDGET } from "../../graphql/budget-documents";
import { UpdateBudgetMutation, Budget } from "../../graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";

interface BudgetUpdateFormProps {
    budget: Budget
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: UpdateBudgetMutation ) => void;
}

export default function BudgetUpdateForm({ 
    budget,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: BudgetUpdateFormProps) {
    const { setInfo } = useTemplateContext();

    const [updateBudget] = useMutation(UPDATE_BUDGET, {
        update(cache, { data: { updateBudget } }) {
            cache.modify({
                fields: {
                    budgets() {
                        cache.writeFragment({
                            data: updateBudget.budget,
                            fragment: NEW_BUDGET,
                        });
                    },
                },
            });
        },
        onError(err) {
            console.log(err.message);
        },
        onCompleted(data) {
            setInfo(data.updateBudget.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const initialValues = {
            code: budget.code,
            name: budget.name,
            amount: budget.amount,
    };

    return (
        <FormDialog
            open={open}
            onOpenChange={setOpen}
            headline="Edit Budget"
            inputFields={[
                {
                    type: "text",
                    name: "code",
                    label: "Kode",
                    disabled: true,
                },
                {
                    type: "text",
                    name: "name",
                    label: "Nama",
                },
                {
                    type: "number",
                    name: "amount",
                    label: "Budget",
                },
            ]}
            initialValues={initialValues}
            validationSchema={Yup.object({
                code: Yup.string().required("Mohon diisi"),
                name: Yup.string().required("Mohon diisi"),
                amount: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await updateBudget({
                    variables: { input }
                });
            }}
        />
    );
}