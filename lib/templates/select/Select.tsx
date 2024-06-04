import React from "react";
import { useField, FieldHookConfig } from "formik";
import SelectOutlined from "../../components/SelectOutlined";
import type { 
    SelectOutlinedProps,
} from "../../components/SelectOutlined";

type SelectProps = SelectOutlinedProps;

export default function Select({ name, ...props }: SelectProps) {
    const [_, meta, helpers] = useField(name);

    return (
        <SelectOutlined 
            {...props} 
            value={meta.value}
            onChange={(value) => helpers.setValue(value)}
            error={meta.touched && meta.error}
        />
    );
}