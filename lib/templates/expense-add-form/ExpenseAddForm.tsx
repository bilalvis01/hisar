"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { ADD_EXPENSE, GET_EXPENSES, GET_BUDGETS } from "../../graphql-documents";
import * as Yup from "yup";

export default function ExpenseAddForm() {
    const [createBudget, { data, loading }] = useMutation(ADD_EXPENSE, {
        refetchQueries: [
            GET_EXPENSES,
            "GetEpenses"
        ]
    });
    const [getBudgets] = useLazyQuery(GET_BUDGETS);

    return (
        <FormDialog
            success={data?.addExpense?.success}
            message={data?.addExpense?.message}
            loading={loading}
            inputFields={[
                {
                    type: "select",
                    name: "budgetAccountId",
                    label: "Akun Budget",
                    onOpenMenu: async () => {
                        const { data: { budgets }, loading, error } = await getBudgets();
                        const data = budgets.map((budget) => ({
                            value: budget.id.toString(),
                            label: budget.name,
                        }));
                        return {
                            loading,
                            error: !!error,
                            data,
                        }
                    }
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
                budgetAccountId: Yup.number().required("Mohon pilih salah satu"),
                description: Yup.string().required("Mohon diisi"),
                amount: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (values) => {
                const input = { ...values, ...{ budgetAccountId: Number(values.budgetAccountId) } };
                await createBudget({
                    variables: { input }
                });
            }}
        />
    );
}