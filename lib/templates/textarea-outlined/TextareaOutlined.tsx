import React from "react";
import { useField, FieldHookConfig } from "formik";
import TextareaOutlined from "../../components/TextareaOutlined";
import type { TextareaOutlinedProps } from "../../components/TextareaOutlined";

type TextFieldProps = FieldHookConfig<TextareaOutlinedProps> & TextareaOutlinedProps;

export default function TextField(props: TextFieldProps) {
    const [field, meta] = useField(props);

    return (
        <TextareaOutlined
            {...field} 
            {...props} 
            error={meta.touched && meta.error}
        />
    );
}