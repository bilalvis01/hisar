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

export default function BudgetAddForm({ open, onOpenChange: setOpen, onSuccess }: BudgetAddFormProps) {
    const [createBudget] = useMutation(CREATE_BUDGET, {
        refetchQueries: [
            GET_BUDGETS,
            "GetBudgets"
        ],
        onCompleted: (data) => {
            setOpen(false);
            onSuccess(data);
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