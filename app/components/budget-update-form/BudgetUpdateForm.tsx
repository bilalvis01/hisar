"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { 
    UPDATE_BUDGET, 
    NEW_BUDGET, 
    GET_EXCERPT_REPORT, 
} from "../../../lib/graphql/budget-documents";
import { GET_BUDGET_TRANSACTIONS } from "../../../lib/graphql/budget-transaction-documents";
import { UpdateBudgetMutation, Budget } from "../../../lib/graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../../context/TemplateProvider";
import style from "./BudgetUpdateForm.module.scss";

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
            headline="Edit Anggaran"
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
                    supportingText: "*Wajib diisi",
                    counter: 255,
                },
                {
                    type: "textarea",
                    name: "description",
                    label: "Deskripsi",
                    counter: 255,
                },
                {
                    type: "number",
                    name: "amount",
                    label: "Nilai",
                    supportingText: "*Wajib diisi",
                },
            ]}
            initialValues={initialValues}
            validationSchema={Yup.object({
                code: Yup.string().required("Kode wajib diisi"),
                name: Yup.string()
                    .required("Nama wajib diisi")
                    .max(255, "Nama tidak boleh melebihi 255 karakter"),
                description: Yup.string()
                    .nullable()
                    .max(255, "Deskripsi tidak boleh melebihi 255 karakter"),
                amount: Yup.number()
                    .typeError("Nilai harus menggunakan angka")
                    .required("Nilai wajib diisi"),
            })}
            onSubmit={async (input) => {
                await updateBudget({
                    variables: { input }
                });
            }}
            classes={{ formDialogBodyMediumSizeScreen: style.formDialogBodyMediumSizeScreen }}
        />
    );
}