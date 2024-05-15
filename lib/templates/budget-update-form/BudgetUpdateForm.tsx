"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { UPDATE_BUDGET, GET_BUDGET_BY_CODE } from "../../graphql-documents";
import * as Yup from "yup";

export default function BudgetUpdateForm(
    { code, name, balance }: 
    { code: string; name: string; balance: number; }
) {
    const [createBudget, { data, loading, reset }] = useMutation(UPDATE_BUDGET, {
        refetchQueries: [
            { query: GET_BUDGET_BY_CODE, variables: { code } },
            "GetBudgetByCode"
        ]
    });

    return (
        <FormDialog
            headline="Edit Budget"
            label="Edit Budget"
            success={data?.updateBudget?.success}
            message={data?.updateBudget?.message}
            loading={loading}
            inputFields={[
                {
                    type: "text",
                    name: "code",
                    label: "Kode Akun",
                    disabled: true,
                },
                {
                    type: "text",
                    name: "name",
                    label: "Nama Akun",
                },
                {
                    type: "number",
                    name: "balance",
                    label: "Saldo",
                },
            ]}
            initialValues={{
                code,
                name,
                balance,
            }}
            validationSchema={Yup.object({
                code: Yup.string().required("Mohon diisi"),
                name: Yup.string().required("Mohon diisi"),
                balance: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await createBudget({
                    variables: { input }
                });
            }}
            onCloseInfo={() => reset()}
        />
    );
}