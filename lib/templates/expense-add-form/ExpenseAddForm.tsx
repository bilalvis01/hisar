"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_EXPENSE, GET_BUDGETS, NEW_EXPENSE } from "../../graphql/documents";
import { CreateExpenseMutation } from "../../graphql/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";

interface ExpenseAddFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: CreateExpenseMutation) => void;
}

export default function ExpenseAddForm({ open, onOpenChange: setOpen, onSuccess }: ExpenseAddFormProps) {
    const { setInfo } = useTemplateContext();

    const [createExpense] = useMutation(CREATE_EXPENSE, {
        update(cache, { data: { createExpense } }) {
            cache.modify({
                fields: {
                    expenses(existingExpenseRefs = [], { readField }) {
                        const newExpense = cache.writeFragment({
                            data: createExpense.expense,
                            fragment: NEW_EXPENSE,
                        });

                        if (existingExpenseRefs.some(
                            ref => readField("id", ref) === createExpense.expense.id
                        )) {
                            return existingExpenseRefs;
                        }

                        return [...existingExpenseRefs, newExpense];
                    }
                }
            })
        },
        onCompleted(data) {
            setInfo(data.createExpense.message);
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
                await createExpense({
                    variables: { input }
                });
            }}
        />
    );
}