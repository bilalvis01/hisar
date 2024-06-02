"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { UpdateBudgetMutation, Budget } from "../../graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";
import { InputField } from "../form-dialog/FormDialog";
import { exportBudgetMany } from "../../utils/exportBudget";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";
import { POLL_INTERVAL } from "../../graphql/pollInterval";
import { useLazyQuery } from "@apollo/client";

interface BudgetExportManyFormProps {
    budgets: Budget[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    onError?: () => void;
}

export default function BudgetExportManyForm({ 
    budgets,
    open,
    onOpenChange: setOpen,
    onSuccess,
    onError,
}: BudgetExportManyFormProps) {
    const { setInfo } = useTemplateContext();

    const [getBudgetTransactions] = useLazyQuery(GET_BUDGET_TRANSACTIONS, {
        pollInterval: POLL_INTERVAL,
    });

    const initialValues = budgets.reduce((acc, budget, index) => {
        acc[`sheet${index + 1}`] = budget.name
            .replaceAll(/\//g, "-")
            .replaceAll(/[\\\?\*\[\]]/g, "")
            .trim();

        return acc;
    }, {
        fileName: "App Budget",
    });

    const inputFields = budgets.reduce<InputField[]>((acc, _, index) => {
        acc.push({
            type: "text",
            name: `sheet${index + 1}`,
            label: `Nama Sheet${index + 1}`,
        });      

        return acc;
    }, [
        {
            type: "text",
            name: "fileName",
            label: "Nama File",
        }
    ]);

    const validationSchema = Yup.object(budgets.reduce((acc, _, index) => {
        acc[`sheet${index + 1}`] = Yup.string()
            .required("Mohon diisi")
            .matches(/^[^\/\\\?\*\[\]]+$/g, "Nama Sheet tidak boleh berisi / \ ? * [ ]");

        return acc;
    }, {
        fileName: Yup.string().required("Mohon diisi"),
    }));

    return (
        <FormDialog<{ fileName: string; [index: string]: string; }>
            open={open}
            onOpenChange={setOpen}
            headline="Export Budget"
            actionLabel="Export"
            inputFields={inputFields}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (names) => {
                await exportBudgetMany({ names, budgets, getBudgetTransactions })
                    .then(() => {
                        if (onSuccess) onSuccess();
                        setInfo("Berhasil melakukan export");
                    })
                    .catch(() => {
                        if (onError) onError();
                        setInfo("Gagal melakukan export");
                    });
            }}
        />
    );
}