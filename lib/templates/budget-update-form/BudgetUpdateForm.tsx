"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useLazyQuery, useMutation } from "@apollo/client";
import { UPDATE_BUDGET, GET_BUDGET_BY_CODE } from "../../graphql-documents";
import { UpdateBudgetMutation } from "../../graphql-tag/graphql";
import * as Yup from "yup";

interface BudgetUpdateFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    code: string; 
    name: string; 
    balance: number;
    onSuccess?: (data: UpdateBudgetMutation ) => void;
}

export default function BudgetUpdateForm({ 
    open,
    onOpenChange,
    code, 
    name, 
    balance, 
    onSuccess,
}: BudgetUpdateFormProps) {
    const [getBudgetByCode] = useLazyQuery(GET_BUDGET_BY_CODE, { variables: { code } });

    const [createBudget, { data, loading }] = useMutation(UPDATE_BUDGET, {
        refetchQueries: [
            { query: GET_BUDGET_BY_CODE, variables: { code } },
            "GetBudgetByCode"
        ],
        onCompleted: onSuccess,
    });

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            headline="Edit Budget"
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
            onOpenForm={async () => {
                const { data: { budgetByCode }, error } = await getBudgetByCode();
                const data = {
                    code: budgetByCode.code,
                    name: budgetByCode.name,
                    balance: budgetByCode.balance,
                };
                return {
                    error,
                    data,
                };
            }}
        />
    );
}