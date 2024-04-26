"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { ADD_EXPENSE, GET_EXPENSES } from "../../graphql-documents";
import * as Yup from "yup";

export default function ExpenseAddForm() {
    const [createBudget, { data, loading }] = useMutation(ADD_EXPENSE, {
        refetchQueries: [
            GET_EXPENSES,
            "GetEpenses"
        ]
    });

    return (
        <FormDialog
            success={data?.addExpense?.success}
            message={data?.addExpense?.message}
            loading={loading}
            inputFields={[
                {
                    type: "number",
                    name: "budgetAccountId",
                    label: "Akun Budget",
                },
                {
                    type: "text",
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
                budgetAccountId: null,
                description: null,
                amount: null,
            }}
            validationSchema={Yup.object({
                name: Yup.string().required("Wajib diisi"),
                budget: Yup.number().typeError("Wajib masukan angka").required("Wajib diisi"),
            })}
            onSubmit={async (input) => {
                createBudget({
                    variables: { input }
                })
            }}
        />
    );
}