"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { Budget } from "../../../lib/graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../../context/TemplateProvider";
import { InputField } from "../form-dialog/FormDialog";
import { exportBudget } from "../../../lib/utils/exportBudget";
import { GET_BUDGET_TRANSACTIONS } from "../../../lib/graphql/budget-transaction-documents";
import { POLL_INTERVAL } from "../../../lib/graphql/pollInterval";
import { useLazyQuery } from "@apollo/client";
import style from "./BudgetExportForm.module.scss";
import createInfo from "../../../lib/utils/createInfo";

interface BudgetExportFormProps {
    budgets: Budget[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    onError?: () => void;
}

export default function BudgetExportForm({ 
    budgets,
    open,
    onOpenChange: setOpen,
    onSuccess,
    onError,
}: BudgetExportFormProps) {
    const { setInfo } = useTemplateContext();

    const budgetNames = budgets.map((budget) => budget.name);

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
        fileName: "App Anggaran Online",
    });

    const inputFields = budgets.reduce<InputField[]>((acc, _, index) => {
        acc.push({
            type: "text",
            name: `sheet${index + 1}`,
            label: `Nama Sheet${index + 1}`,
            supportingText: "*Wajib Diisi",
        });      

        return acc;
    }, [
        {
            type: "text",
            name: "fileName",
            label: "Nama File",
            supportingText: "*Wajib Diisi",
        }
    ]);

    const validationSchema = Yup.object(budgets.reduce((acc, _, index) => {
        acc[`sheet${index + 1}`] = Yup.string()
            .required("Nama lembar wajib diisi")
            .matches(/^[^\/\\\?\*\[\]]+$/g, "Nama Sheet tidak boleh berisi / \ ? * [ ]");

        return acc;
    }, {
        fileName: Yup.string().required("Nama file wajib diisi"),
    }));

    return (
        <FormDialog<{ fileName: string; [index: string]: string; }>
            open={open}
            onOpenChange={setOpen}
            headline="Export Anggaran"
            actionLabel="Export"
            inputFields={inputFields}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (names) => {
                try {
                    await exportBudget({ names, budgets, getBudgetTransactions });

                    if (onSuccess) onSuccess();
                    setOpen(false);
                    setInfo(createInfo(budgetNames, "berhasil export "));
                } catch(error) {
                    setInfo(error.message);
                }
            }}
            classes={{ formDialogBodyMediumSizeScreen: style.formDialogBodyMediumSizeScreen }}
        />
    );
}