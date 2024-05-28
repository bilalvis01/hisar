"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { GET_BUDGETS, NEW_BUDGET_TRANSACTION } from "../../graphql/budget-documents";
import { CREATE_EXPENSE } from "../../graphql/expense-documents";
import { CreateExpenseMutation } from "../../graphql/generated/graphql";
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
                            fragment: NEW_BUDGET_TRANSACTION,
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
                    name: "budgetCode",
                    label: "Budget",
                    onOpenMenu: async () => {
                        const { data: { budgets }, loading, error } = await getBudgets();
                        const data = budgets.map((budget) => ({
                            value: budget.code,
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
                budgetCode: null,
                description: null,
                amount: null,
            }}
            validationSchema={Yup.object({
                budgetCode: Yup.string().required("Mohon pilih salah satu"),
                description: Yup.string().required("Mohon diisi"),
                amount: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await createExpense({
                    variables: { input }
                });
            }}
        />
    );
}