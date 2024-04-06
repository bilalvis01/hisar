import React from "react";
import { 
    Formik, 
    Form, 
    Field, 
    ErrorMessage,
} from "formik";
import ButtonSolid from "../../components/ButtonSolid";

export default function AddForm() {
    return (
        <Formik
            initialValues={{
                description: "",
                budget: "",
            }}
            validate={values => {
                const errors = {
                    description: "",
                    budget: "",
                };

                if (!values.description) {
                    errors.description = "Required";
                }

                if (!values.budget) {
                    errors.description = "Required";
                }

                return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                }, 500);
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <Field type="text" name="Deskripsi" /> 
                    <Field type="number" name="Budget" />
                    <ButtonSolid type="submit" disabled={isSubmitting}>
                        submit
                    </ButtonSolid>
                </Form>
            )}
        </Formik>
    )
}