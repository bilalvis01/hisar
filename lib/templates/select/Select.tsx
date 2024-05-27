import React from "react";
import TextFieldOutlined, { TextFieldOutlinedProps } from "../../components/TextFieldOutlined";
import { Menu, MenuItem } from "../../components/Menu";
import { useField } from "formik";
import IconCaretDownFill from "../../icons/CaretDownFill";
import style from "./Select.module.scss";
import ProgressCircular from "../../components/ProgressCircular";
import clsx from "clsx";

interface OpenMenuHandlerReturn {
    loading: boolean,
    error: boolean,
    data?: Option[],
}

export type OpenMenuHandler = () => Promise<OpenMenuHandlerReturn>;

export interface Option {
    value: string;
    label: string;
}

export interface SelectOutlinedProps extends TextFieldOutlinedProps {
    options?: Option[];
    onOpenMenu?: OpenMenuHandler,
}

export default function Select({ 
    options: options_ = [], 
    name, 
    label,
    onOpenMenu: handleOpenMenu,
    disabled,
    ...textFieldProps
}: SelectOutlinedProps) {
    const menuRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const caretRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState(options_);
    const [filteredOptions, setFilteredOptions] = React.useState(options_);
    const [filtering, setFiltering] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [_, meta, helpers] = useField(name);
    const value = meta?.value?.toString();
    const { setValue } = helpers;

    const handleMenuChange = (selectedValue) => {
        setValue(selectedValue);
        setInputValue(options.filter((option) => option.value === selectedValue)[0]?.label);
        setOpen(false);
        if (inputRef.current instanceof HTMLInputElement) {
            inputRef.current.blur();
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        if (
            menuRef.current.contains(event.relatedTarget) || 
            event.relatedTarget == menuRef.current ||
            event.relatedTarget == caretRef.current 
        ) {
            return;
        }
        setOpen(false);
        setFiltering(false);
    }

    const handleFocus = () => {
        setOpen(true);
        setFilteredOptions([]);
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
    }

    const handleClickCaret = React.useCallback(() => {
        if (inputRef.current instanceof HTMLInputElement) {
            if (open) inputRef.current.blur();
            else inputRef.current.focus();
        }
    }, [open]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setInputValue(inputValue);
        const filteredOptions = options.filter((option) => {
            return option.label.toLowerCase().includes(inputValue.toLowerCase());
        });
        setFilteredOptions(filteredOptions);
        setFiltering(true);
    }

    const handleSetInputValue = (options: Option[]) => {
        const selectedOption = options.filter((option) => option.value === value)[0];
        if (selectedOption) setInputValue(selectedOption.label);
    };

    /*
    React.useEffect(() => {
        if (open) {
            if (handleOpenMenu) {
                setLoading(true);
                handleOpenMenu().then(({ error, data }) => {
                    if (error) {
                        setError(true);
                    } else {
                        setOptions(data);
                        setFilteredOptions([]);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
            } else {
                setOptions(options_);
            }
        } else {
            setError(false);
        }
    }, [open]);
    */

    React.useEffect(() => {
        if (handleOpenMenu) {
            setLoading(true);
            handleOpenMenu().then(({ error, data: options }) => {
                if (error) {
                    setError(true);
                } else {
                    setOptions(options);
                    setFilteredOptions([]);
                    handleSetInputValue(options);
                }
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            setOptions(options_);
            handleSetInputValue(options_)
        }
    }, []);

    React.useEffect(() => {
        if (!open) {
            handleSetInputValue(options);
        }
    }, [open]);

    const caret = !disabled  
        ? (
            <button 
                ref={caretRef}
                type="button" 
                className={style.caretButton}
                onClick={handleClickCaret}
                onMouseDown={handleMouseDown}
            >
                <IconCaretDownFill />
            </button>
        )
        : null;

    let menuHeight_;
    
    if (filteredOptions.length != 0 && filteredOptions.length > 4) menuHeight_ = 4;
    else if (filteredOptions.length != 0) menuHeight_ = filteredOptions.length;
    else if (filteredOptions.length == 0 && filtering) menuHeight_ = 1;
    else if (options.length > 4) menuHeight_ = 4
    else menuHeight_ = options.length;

    const menuHeight = `${menuHeight_ * 3 + 0.5 * 2}rem`;

    const menu = loading
        ? (
            <div className={style.placeholder}>
                <ProgressCircular />
            </div>
        )
        : error
        ? (
            <div className={clsx(style.placeholder, style.error, "text-label-medium")}>
                <span>Gagal mengambil data</span>
            </div>
        )
        : filteredOptions.length == 0 && filtering
        ? (
            <div className={clsx(style.placeholder, "text-label-medium")}>
                <span>Pencarian tidak ada</span>
            </div>
        )
        : filteredOptions.length > 0
        ? (
            <Menu 
                ref={menuRef}
                initialValue={value}
                value={value}
                onChange={handleMenuChange} 
                onMouseDown={handleMouseDown}
                className={style.menu}
                style={{ height: menuHeight }}
            >
                <ul>
                    {filteredOptions.map((option) => {
                        const highlightIndexStart = option.label.search(inputValue);
                        const highlightIndexEnd = highlightIndexStart + inputValue.length;
                        const highlight = option.label.slice(highlightIndexStart, highlightIndexEnd);
                        const first = option.label.slice(0, highlightIndexStart);
                        const last = option.label.slice(highlightIndexEnd);

                        return (
                            <li key={option.value}>
                                <MenuItem value={option.value}>
                                    {first}
                                    <span className={style.highlight}>{highlight}</span>
                                    {last}
                                </MenuItem>
                            </li>
                        );
                    })}
                </ul>
            </Menu>
        )
        : (
            <Menu 
                ref={menuRef}
                initialValue={value}
                value={value}
                onChange={handleMenuChange} 
                onMouseDown={handleMouseDown}
                className={style.menu}
                style={{ height: menuHeight }}
            >
                <ul>
                    {options.map((option) => (
                        <li key={option.value}>
                            <MenuItem value={option.value}>
                                {option.label}
                            </MenuItem>
                        </li>
                    ))}
                </ul>
            </Menu>
        );

    return (
        <div className={style.container} >
            <TextFieldOutlined 
                {...textFieldProps}
                ref={inputRef}
                type="text" 
                value={inputValue}
                name={name} 
                label={label} 
                endIcon={caret}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={handleInputChange}
                error={meta.touched && meta.error}
                disabled={disabled}
            />
            {open && menu}
        </div>
    );
}