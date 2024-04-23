import React from "react";
import { useField, FieldHookConfig } from "formik";
import TextFieldOutlined  from "../components/TextFieldOulined";
import type { TextFieldOutlinedProps } from "../components/TextFieldOulined";

type TextFieldProps = FieldHookConfig<TextFieldOutlinedProps> & TextFieldOutlinedProps;

export default function TextField(props: TextFieldProps) {
    const [field, meta] = useField(props);

    return (
        <TextFieldOutlined 
            {...field} 
            {...props} 
            error={meta.touched && meta.error}
        />
    );
}