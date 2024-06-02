"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { UpdateBudgetMutation, Budget } from "../../graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../Template";
import { exportBudget } from "../../utils/exportBudget";
import { GET_BUDGET_TRANSACTIONS } from "../../graphql/budget-transaction-documents";
import { POLL_INTERVAL } from "../../graphql/pollInterval";
import { useLazyQuery } from "@apollo/client";

interface BudgetExportFormProps {
    budget: Budget;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    onError?: () => void;
}

export default function BudgetExportForm({ 
    budget,
    open,
    onOpenChange: setOpen,
    onSuccess,
    onError,
}: BudgetExportFormProps) {
    const { setInfo } = useTemplateContext();

    const [getBudgetTransactions] = useLazyQuery(GET_BUDGET_TRANSACTIONS, {
        pollInterval: POLL_INTERVAL,
    });

    return (
        <FormDialog<{ fileName: string; sheetName: string; }>
            open={open}
            onOpenChange={setOpen}
            headline="Export Budget"
            actionLabel="Export"
            inputFields={[
                {
                    type: "text",
                    name: "fileName",
                    label: "Nama File",
                },
                {
                    type: "text",
                    name: "sheetName",
                    label: "Nama Sheet",
                },
            ]}
            initialValues={{
                fileName: budget.name,
                sheetName: "Expense",
            }}
            validationSchema={Yup.object({
                fileName: Yup.string()
                    .required("Mohon Diisi"),
                sheetName: Yup.string()
                    .required("Mohon diisi")
                    .matches(/^[^\/\\\?\*\[\]]+$/g, "Nama Sheet tidak boleh berisi / \ ? * [ ]"),
            })}
            onSubmit={async ({ fileName, sheetName }) => {
                try {
                    await exportBudget({ 
                        fileName: fileName, 
                        sheetName: sheetName,
                        budget, 
                        getBudgetTransactions,
                    });

                    setInfo("Berhasil melakukan export budget");
                } catch(error) {
                    setInfo(error.message);
                }
            }}
        />
    );
}