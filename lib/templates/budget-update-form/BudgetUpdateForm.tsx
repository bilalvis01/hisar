"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { 
    UPDATE_BUDGET, 
    NEW_BUDGET, 
    GET_EXCERPT_REPORT, 
} from "../../graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";
import { UpdateBudgetMutation, Budget } from "../../graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";
import { INTERNAL_SERVER_ERROR } from "../../graphql/error-code";

interface BudgetUpdateFormProps {
    budget: Budget
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
    const { setInfo } = useTemplateContext();

    const [updateBudget] = useMutation(UPDATE_BUDGET, {
        refetchQueries: [
            { query: GET_BUDGET_TRANSACTIONS, variables: { input: { budgetCode: budget.code } } },
            { query: GET_EXCERPT_REPORT },
        ],
        update(cache, { data: { updateBudget } }) {
            cache.writeFragment({
                data: updateBudget,
                fragment: NEW_BUDGET,
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onError(error) {
            setInfo(`"${budget.name}" gagal diperbarui`);
        },
        onCompleted(data) {
            setInfo(`${data.updateBudget.name} berhasil diperbarui`);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const initialValues = {
            code: budget.code,
            name: budget.name,
            description: budget.description,
            amount: budget.amount,
    };

    return (
        <FormDialog<{ code: string; name: string; description?: string; amount: number; }>
            open={open}
            onOpenChange={setOpen}
            headline="Edit Budget"
            inputFields={[
                {
                    type: "text",
                    name: "code",
                    label: "Kode",
                    disabled: true,
                },
                {
                    type: "text",
                    name: "name",
                    label: "Nama",
                },
                {
                    type: "textarea",
                    name: "description",
                    label: "Deskripsi",
                },
                {
                    type: "number",
                    name: "amount",
                    label: "Budget",
                },
            ]}
            initialValues={initialValues}
            validationSchema={Yup.object({
                code: Yup.string().required("Mohon diisi"),
                name: Yup.string().required("Mohon diisi"),
                description: Yup.string().nullable(),
                amount: Yup.number().typeError("Mohon masukan angka").required("Mohon diisi"),
            })}
            onSubmit={async (input) => {
                await updateBudget({
                    variables: { input }
                });
            }}
        />
    );
}