"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { CREATE_BUDGET, GET_BUDGETS, NEW_BUDGET } from "../../graphql-documents";
import { CreateBudgetMutation } from "../../graphql/graphql";
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
                            ref => readField("id", ref) === createBudget.budget.id
                        )) {
                            return existingBudgetRefs;
                        }

                        return [...existingBudgetRefs, newBudget];
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
        <FormDialog
            open={open}
            onOpenChange={setOpen}
            headline="Buat Budget"
            inputFields={[
                {
                    type: "text",
                    name: "name",
                    label: "Nama Akun",
                },
                {
                    type: "number",
                    name: "budget",
                    label: "Nilai",
                },
            ]}
            initialValues={{
                name: null,
                budget: null,
            }}
            validationSchema={Yup.object({
                name: Yup.string().required("Mohon diisi"),
                budget: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await createBudget({
                    variables: { input }
                });
            }}
        />
    );
}