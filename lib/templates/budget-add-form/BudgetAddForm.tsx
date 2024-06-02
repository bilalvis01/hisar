"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { CREATE_BUDGET, GET_BUDGETS, NEW_BUDGET } from "../../graphql/budget-documents";
import { CreateBudgetMutation } from "../../graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";

interface BudgetAddFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: CreateBudgetMutation) => void;
}

export default function BudgetAddForm({ open, onOpenChange: setOpen, onSuccess }: BudgetAddFormProps) {
    const { setInfo } = useTemplateContext();

    const [createBudget] = useMutation(CREATE_BUDGET, {
        update(cache, { data: { createBudget } }) {
            cache.modify({
                fields: {
                    budgets(existingBudgetRefs = [], { readField }) {
                        const newBudget = cache.writeFragment({
                            data: createBudget.budget,
                            fragment: NEW_BUDGET,
                        });

                        if (existingBudgetRefs.some(
                            ref => readField("code", ref) === createBudget.budget.code
                        )) {
                            return existingBudgetRefs;
                        }

                        return [newBudget, ...existingBudgetRefs];
                    },
                }
            });
        },
        onCompleted: (data) => {
            setInfo(data.createBudget.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    return (
        <FormDialog<{ name: string; description: string; amount: number; }>
            open={open}
            onOpenChange={setOpen}
            headline="Buat Budget"
            inputFields={[
                {
                    type: "text",
                    name: "name",
                    label: "Nama",
                },
                {
                    type: "textarea",
                    name: "description",
                    label: "Deskripsi",
                },
                {
                    type: "number",
                    name: "amount",
                    label: "Nilai",
                },
            ]}
            initialValues={{
                name: null,
                amount: null,
                description: null,
            }}
            validationSchema={Yup.object({
                name: Yup.string().required("Mohon diisi"),
                amount: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
                description: Yup.string().nullable(),
            })}
            onSubmit={async (input) => {
                await createBudget({
                    variables: { input }
                });
            }}
        />
    );
}