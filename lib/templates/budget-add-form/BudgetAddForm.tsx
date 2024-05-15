"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { CREATE_BUDGET, GET_BUDGETS } from "../../graphql-documents";
import * as Yup from "yup";
import IconPlusLg from "../../icons/PlusLg";

export default function BudgetForm() {
    const [createBudget, { data, loading, reset }] = useMutation(CREATE_BUDGET, {
        refetchQueries: [
            GET_BUDGETS,
            "GetBudgets"
        ]
    });

    return (
        <FormDialog
            headline="Buat Budget"
            label="Buat Budget"
            fab={true}
            fabIcon={<IconPlusLg />}
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
            onCloseInfo={() => reset()}
        />
    );
}