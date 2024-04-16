import React from "react";
import { 
    Formik, 
    Form, 
    Field,
} from "formik";
import * as Yup from "yup";
import ButtonSolid from "../../components/ButtonFIlled";
import TextField from "../TextField";
import style from "./BudgetAddForm.module.scss";

interface AddFormProps {
    id: string;
}

export default function AddForm({ id }: AddFormProps) {
    return (
        <Formik
            initialValues={{
                description: "",
                budget: "",
            }}
            validationSchema={Yup.object({
                description: Yup.string().required("Wajib diisi"),
                budget: Yup.number().typeError("Wajib masukan angka").required("Wajib diisi"),
            })}
            onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                }, 2000);
            }}
        >
            {({ isSubmitting }) => (
                <Form id={id}>
                    <TextField className={style.field} type="text" label="Deskripsi" name="description" inputMax={50}/> 
                    <TextField className={style.field} type="text" label="Budget" name="budget" />
                </Form>
            )}
        </Formik>
    )
}