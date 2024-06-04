"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { 
    GET_BUDGETS, 
    GET_BUDGET_BY_CODE,
    GET_EXCERPT_REPORT,
} from "../../graphql/budget-documents";
import { NEW_BUDGET_TRANSACTION } from "../../graphql/budget-transaction-documents";
import { UPDATE_EXPENSE } from "../../graphql/expense-documents";
import { UpdateExpenseMutation, BudgetTransaction } from "../../graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";
import { POLL_INTERVAL } from "../../graphql/pollInterval";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";

interface ExpenseUpdateFormProps {
    expense: BudgetTransaction,
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: UpdateExpenseMutation) => void;
    disableBudgetSelection?: boolean;
}

export default function ExpenseUpdateForm({ 
    expense, 
    open, 
    onOpenChange: setOpen, 
    onSuccess,
    disableBudgetSelection = false,
}: ExpenseUpdateFormProps) {
    const { setInfo } = useTemplateContext();

    const [updateExpense] = useMutation(UPDATE_EXPENSE, {
        refetchQueries(result) {
            const budgetCode = result.data && 
                result.data.updateExpense && 
                result.data.updateExpense.budgetCode;
                
            return [
                { query: GET_BUDGET_BY_CODE, variables: { input: { code: budgetCode, } } },
                { query: GET_BUDGET_TRANSACTIONS, variables: { input: { budgetCode: budgetCode } } },
                { query: GET_EXCERPT_REPORT },
            ];
        },
        update(cache, { data: { updateExpense } }) {
            cache.writeFragment({
                data: updateExpense,
                fragment: NEW_BUDGET_TRANSACTION,
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onError(error, { variables: { input } }) {
            setInfo(`"${input.description}" gagal diperbarui`);
        },
        onCompleted(data) {
            setInfo(`"${data.updateExpense.description}" berhasil diperbarui`);
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
            headline="Edit Expense"
            inputFields={[
                {
                    type: "text",
                    name: "id",
                    label: "ID",
                    disabled: true,
                },
                {
                    type: "select",
                    name: "budgetCode",
                    label: "Budget",
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
                id: expense.id,
                budgetCode: expense.budgetCode,
                description: expense.description,
                amount: expense.amount,
            }}
            validationSchema={Yup.object({
                id: Yup.string()
                    .required("Mohon diisi"),
                budgetCode: Yup.string()
                    .required("Mohon pilih salah satu"),
                description: Yup.string()
                    .required("Mohon diisi")
                    .max(255, "Mohon tidak melebihi 255 karakter"),
                amount: Yup.number()
                    .typeError("Mohon masukan angka")
                    .required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await updateExpense({
                    variables: { input }
                });
            }}
        />
    );
}