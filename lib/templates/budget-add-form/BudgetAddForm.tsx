"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { CREATE_BUDGET, GET_BUDGETS } from "../../graphql-documents";
import { CreateBudgetMutation } from "../../graphql-tag/graphql";
import * as Yup from "yup";

interface BudgetAddFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: CreateBudgetMutation) => void;
}

export default function BudgetAddForm({ open, onOpenChange, onSuccess }: BudgetAddFormProps) {
    const [createBudget, { data, loading, reset }] = useMutation(CREATE_BUDGET, {
        refetchQueries: [
            GET_BUDGETS,
            "GetBudgets"
        ],
        onCompleted: onSuccess,
    });

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            headline="Buat Budget"
            success={data?.createBudget?.success}
            message={data?.createBudget?.message}
            loading={loading}
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