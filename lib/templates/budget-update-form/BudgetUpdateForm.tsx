"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useLazyQuery, useMutation } from "@apollo/client";
import { UPDATE_BUDGET, GET_BUDGET_BY_CODE, NEW_BUDGET } from "../../graphql-documents";
import { UpdateBudgetMutation, Budget } from "../../graphql-tag/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";

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

    const [getBudgetByCode] = useLazyQuery(GET_BUDGET_BY_CODE);

    const [updateBudget] = useMutation(UPDATE_BUDGET, {
        onCompleted(data) {
            setInfo(data.updateBudget.message);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    const initialValues = {
            code: budget.code,
            name: budget.name,
            balance: budget.balance,
    };

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