"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_BUDGET, GET_BUDGETS } from "../../graphql-documents";
import * as Yup from "yup";

export default function ExpenseAddForm() {
    const [createBudget, { data, loading }] = useMutation(CREATE_BUDGET, {
        refetchQueries: [
            GET_BUDGETS,
            "GetBudgets"
        ]
    });

    return (
        <FormDialog
            headline="Tambah Expense"
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