"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useLazyQuery, useMutation } from "@apollo/client";
import { UPDATE_BUDGET, GET_BUDGET_BY_CODE, GET_BUDGETS } from "../../graphql-documents";
import { UpdateBudgetMutation, Budget } from "../../graphql-tag/graphql";
import * as Yup from "yup";

interface BudgetUpdateFormProps {
    budget: string | Budget
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: UpdateBudgetMutation ) => void;
}

export default function BudgetUpdateForm({ 
    budget,
    open,
    onOpenChange: setOpen,
    onSuccess,
}: BudgetUpdateFormProps) {
    const [getBudgetByCode, { data: getBudgetByCodeData }] = useLazyQuery(GET_BUDGET_BY_CODE);

    const code = budget && typeof budget === "object" 
        ? budget
        : getBudgetByCode 
        ? getBudgetByCodeData.budgetByCode.budget.code
        : "";

    const [updateBudget, { data: updateBudgetData }] = useMutation(UPDATE_BUDGET, {
        refetchQueries: [
            { query: GET_BUDGET_BY_CODE, variables: { code } },
            "GetBudgetByCode",
            GET_BUDGETS,
            "GetBudgets",
        ],
        onCompleted: (data) => {
            setOpen(false);
            onSuccess(data);
        },
    });

    const initialValues = typeof budget === "string" 
        ? async () => {
            const { data, error } = await getBudgetByCode({ variables: { code: budget } });
            const values = {
                code: data.budgetByCode.budget.code,
                name: data.budgetByCode.budget.name,
                balance: data.budgetByCode.budget.balance,
            };
            return {
                error,
                values,
            };
        }
        : budget && typeof budget === "object" 
        ? {
            code: budget.code,
            name: budget.name,
            balance: budget.balance,
        }
        : null;

    return (
        <FormDialog
            open={open}
            onOpenChange={setOpen}
            headline="Edit Budget"
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
            initialValues={initialValues}
            validationSchema={Yup.object({
                code: Yup.string().required("Mohon diisi"),
                name: Yup.string().required("Mohon diisi"),
                balance: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await updateBudget({
                    variables: { input }
                });
            }}
        />
    );
}