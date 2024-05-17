"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { ADD_EXPENSE, GET_BUDGETS, NEW_EXPENSE } from "../../graphql-documents";
import { AddExpenseMutation } from "../../graphql-tag/graphql";
import * as Yup from "yup";

interface ExpenseAddFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: AddExpenseMutation) => void;
}

export default function ExpenseAddForm({ open, onOpenChange: setOpen, onSuccess }: ExpenseAddFormProps) {
    const [addExpense] = useMutation(ADD_EXPENSE, {
        update(cache, { data: { addExpense } }) {
            cache.modify({
                fields: {
                    expenses(existingExpenseRefs = [], { readField }) {
                        const newExpense = cache.writeFragment({
                            data: addExpense.expense,
                            fragment: NEW_EXPENSE,
                        });

                        if (existingExpenseRefs.some(
                            ref => readField("id", ref) === addExpense.expense.id
                        )) {
                            return existingExpenseRefs;
                        }

                        return [...existingExpenseRefs, newExpense];
                    }
                }
            })
        },
        onCompleted(data) {
            setOpen(false);
            onSuccess(data);
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
                await addExpense({
                    variables: { input }
                });
            }}
        />
    );
}