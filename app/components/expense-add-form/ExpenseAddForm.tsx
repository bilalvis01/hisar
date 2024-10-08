"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { 
    GET_BUDGETS, 
    GET_BUDGET_BY_CODE, 
    GET_EXCERPT_REPORT, 
} from "../../../lib/graphql/budget-documents";
import { NEW_BUDGET_TRANSACTION } from "../../../lib/graphql/budget-transaction-documents";
import { CREATE_EXPENSE } from "../../../lib/graphql/expense-documents";
import { CreateExpenseMutation } from "../../../lib/graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../../context/TemplateProvider";
import { POLL_INTERVAL } from "../../../lib/graphql/pollInterval";

interface ExpenseAddFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: CreateExpenseMutation) => void;
    budgetCode?: string;
    disableBudgetSelection?: boolean;
}

export default function ExpenseAddForm({ 
    open, 
    onOpenChange: setOpen, 
    onSuccess,
    budgetCode,
    disableBudgetSelection = false,
}: ExpenseAddFormProps) {
    const { setInfo } = useTemplateContext();

    const [createExpense] = useMutation(CREATE_EXPENSE, {
        refetchQueries(result) {
            const budgetCode = result.data && 
                result.data.createExpense && 
                result.data.createExpense.budgetCode;
                
            return [
                { query: GET_BUDGET_BY_CODE, variables: { input: { code: budgetCode, } } },
                { query: GET_EXCERPT_REPORT },
            ];
        },
        update(cache, { data: { createExpense } }) {
            cache.modify({
                fields: {
                    budgetTransactions(existingExpenseRefs = [], { readField }) {
                        const newExpense = cache.writeFragment({
                            data: createExpense,
                            fragment: NEW_BUDGET_TRANSACTION,
                        });

                        if (existingExpenseRefs.some(
                            ref => readField("id", ref) === createExpense.id
                        )) {
                            return existingExpenseRefs;
                        }

                        return [newExpense, ...existingExpenseRefs];
                    }
                }
            })
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onError(error, { variables: { input } }) {
            setInfo(`"${input.description}" gagal ditambahkan`);
        },
        onCompleted(data) {
            setInfo(`"${data.createExpense.description}" berhasil ditambahkan`);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const [getBudgets] = useLazyQuery(GET_BUDGETS, {
        pollInterval: POLL_INTERVAL,
    });

    return (
        <FormDialog
            open={open}
            onOpenChange={setOpen}
            headline="Tambah Pengeluaran"
            inputFields={[
                {
                    type: "select",
                    name: "budgetCode",
                    label: "Anggaran",
                    supportingText: "*Wajib pilih salah satu",
                    disabled: disableBudgetSelection,
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
                    supportingText: "*Wajib diisi",
                    counter: 255,
                },
                {
                    type: "number",
                    name: "amount",
                    label: "Nilai",
                    supportingText: "*Wajib diisi",
                },
            ]}
            initialValues={{
                budgetCode,
                description: null,
                amount: null,
            }}
            validationSchema={Yup.object({
                budgetCode: Yup.string()
                    .required("Wajib pilih salah satu anggaran"),
                description: Yup.string()
                    .required("Deskripsi wajib diisi")
                    .max(255, "Mohon tidak melebihi 255 karakter"),
                amount: Yup.number()
                    .typeError("Nilai wajib menggunakan angka")
                    .required("Nilai wajib diisi"),
            })}
            onSubmit={async (input) => {
                await createExpense({
                    variables: { input }
                });
            }}
        />
    );
}