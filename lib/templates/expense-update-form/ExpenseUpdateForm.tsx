"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation, useLazyQuery } from "@apollo/client";
import { GET_BUDGETS, GET_BUDGET_BY_CODE, NEW_BUDGET_TRANSACTION } from "../../graphql/budget-documents";
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
                result.data.updateExpense.expense && 
                result.data.updateExpense.expense.budgetCode;
                
            return [
                { query: GET_BUDGET_BY_CODE, variables: { input: { code: budgetCode, } } },
                { query: GET_BUDGET_TRANSACTIONS, variables: { input: { budgetCode: budgetCode } } },
            ];
        },
        update(cache, { data: { updateExpense } }) {
            cache.writeFragment({
                data: updateExpense.expense,
                fragment: NEW_BUDGET_TRANSACTION,
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onCompleted(data) {
            setInfo(data.updateExpense.message);
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
                },
                {
                    type: "number",
                    name: "amount",
                    label: "Nilai",
                },
            ]}
            initialValues={{
                id: expense.id,
                budgetCode: expense.budgetCode,
                description: expense.description,
                amount: expense.amount,
            }}
            validationSchema={Yup.object({
                id: Yup.string().required("Mohon diisi"),
                budgetCode: Yup.string().required("Mohon pilih salah satu"),
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