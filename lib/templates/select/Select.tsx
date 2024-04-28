import React from "react";
import TextFieldOutlined from "../../components/TextFieldOutlined";
import { Menu, MenuItem } from "../../components/Menu";
import { useField } from "formik";
import IconCaretDownFill from "../../icons/CaretDownFill";
import style from "./Select.module.scss";

export interface Option {
    value: string;
    label: string;
}

export interface SelectOutlinedProps {
    name: string;
    options?: Option[];
    label?: string;
}

export default function Select({ 
    options = [], 
    name, 
    label,
}: SelectOutlinedProps) {
    const menuRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const caretRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [_, meta, helpers] = useField(name);
    const { value } = meta;
    const { setValue } = helpers;

    const handleMenuChange = (value) => {
        setValue(value);
        setOpen(false);
    };

    const selectedOptionLabel = options.filter((option) => option.value === meta.value)[0]?.label;

    const handleBlur = (event) => {
        if (menuRef.current.contains(event.relatedTarget) || event.relatedTarget == caretRef.current) {
            return;
        }
        setOpen(false);
    }

    const handleFocus = () => {
        setOpen(true);
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }

    const handleClickCaret = React.useCallback(() => {
        if (inputRef.current instanceof HTMLInputElement) {
            if (open) inputRef.current.blur();
            else inputRef.current.focus();
        }
    }, [open]);

    const caret = (
        <button 
            ref={caretRef}
            type="button" 
            className={style.caretButton}
            onClick={handleClickCaret}
            onMouseDown={handleMouseDown}
        >
            <IconCaretDownFill />
        </button>
    );

    return (
        <div className={style.container} >
            <TextFieldOutlined 
                ref={inputRef}
                type="text" 
                value={selectedOptionLabel}
                name={name} 
                label={label} 
                endIcon={caret}
                onBlur={handleBlur}
                onFocus={handleFocus}
            />
            {open && (
                <Menu 
                    ref={menuRef}
                    initialValue={value}
                    value={value}
                    onChange={handleMenuChange} 
                    className={style.menu}
                >
                    <ul>
                        {options.map((option) =>
                            <li key={option.value}>
                                <MenuItem value={option.value}>{option.label}</MenuItem>
                            </li>
                        )}
                    </ul>
                </Menu>
            )}
        </div>
    );
}