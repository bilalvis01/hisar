"use client"

import React from "react";
import FormDialog from "../form-dialog/FormDialog";
import { useMutation } from "@apollo/client";
import { CREATE_BUDGET, NEW_BUDGET, GET_EXCERPT_REPORT } from "../../../lib/graphql/budget-documents";
import { CreateBudgetMutation } from "../../../lib/graphql/generated/graphql";
import * as Yup from "yup";
import { useTemplateContext } from "../../context/TemplateProvider";
import style from "./BudgetAddForm.module.scss";

interface BudgetAddFormProps {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    onSuccess?: (data: CreateBudgetMutation) => void;
}

export default function BudgetAddForm({ open, onOpenChange: setOpen, onSuccess }: BudgetAddFormProps) {
    const { setInfo } = useTemplateContext();

    const [createBudget] = useMutation(CREATE_BUDGET, {
        refetchQueries: [
            { query: GET_EXCERPT_REPORT },
        ],
        update(cache, { data: { createBudget } }) {
            cache.modify({
                fields: {
                    budgets(existingBudgetRefs = [], { readField }) {
                        const newBudget = cache.writeFragment({
                            data: createBudget,
                            fragment: NEW_BUDGET,
                        });

                        if (existingBudgetRefs.some(
                            ref => readField("code", ref) === createBudget.code
                        )) {
                            return existingBudgetRefs;
                        }

                        return [newBudget, ...existingBudgetRefs];
                    },
                }
            });
        },
        onQueryUpdated(observableQuery) {
            return observableQuery.refetch();
        },
        onError(error, { variables: { input } }) {
            setInfo(`"${input.name}" gagal dibuat`);
        },
        onCompleted(data) {
            setInfo(`"${data.createBudget.name}" berhasil dibuat`);
            setOpen(false);
            if (onSuccess) onSuccess(data);
        },
    });

    return (
        <FormDialog<{ name: string; description?: string; amount: number; }>
            open={open}
            onOpenChange={setOpen}
            headline="Buat Anggaran"
            inputFields={[
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
            initialValues={{
                name: null,
                amount: null,
                description: null,
            }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required("Nama wajib diisi")
                    .max(255, "Nama tidak boleh melebihi 255 karakter"),
                description: Yup.string()
                    .nullable()
                    .max(255, "Deskripsi tidak melebihi 255 karakter"),
                amount: Yup.number()
                    .typeError("Nilai harus menggunkan angka")
                    .required("Nilai wajib diisi"),
            })}
            onSubmit={async (input) => {
                await createBudget({
                    variables: { input }
                });
            }}
            classes={{ formDialogBodyMediumSizeScreen: style.formDialogBodyMediumSizeScreen }}
        />
    );
}