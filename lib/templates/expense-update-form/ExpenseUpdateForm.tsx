"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { UPDATE_EXPENSE, GET_BUDGETS, NEW_EXPENSE } from "../../graphql-documents";
import { UpdateExpenseMutation, Expense } from "../../graphql-tag/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";

interface ExpenseAddFormProps {
    expense: Expense,
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: UpdateExpenseMutation) => void;
}

export default function ExpenseAddForm({ 
    expense, 
    open, 
    onOpenChange: setOpen, 
    onSuccess 
}: ExpenseAddFormProps) {
    const { setInfo } = useTemplateContext();

    const [updateExpense] = useMutation(UPDATE_EXPENSE, {
        onCompleted(data) {
            console.log(data.updateExpense.message);
            setInfo(data.updateExpense.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const [getBudgets] = useLazyQuery(GET_BUDGETS);

    return (
        <FormDialog
            open={open}
            onOpenChange={setOpen}
            headline="Tambah Expense"
            inputFields={[
                {
                    type: "text",
                    name: "code",
                    label: "Kode Akun",
                    disabled: true,
                },
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
                code: expense.code,
                budgetAccountId: expense.budgetAccountId,
                description: expense.description,
                amount: expense.amount,
            }}
            validationSchema={Yup.object({
                code: Yup.string().required("Mohon diisi"),
                budgetAccountId: Yup.number().required("Mohon pilih salah satu"),
                description: Yup.string().required("Mohon diisi"),
                amount: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await updateExpense({
                    variables: { input }
                });
            }}
        />
    );
}