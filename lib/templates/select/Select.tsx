import React from "react";
import TextFieldOutlined from "../../components/TextFieldOutlined";
import { Menu, MenuItem } from "../../components/Menu";
import { useField } from "formik";
import IconCaretDownFill from "../../icons/CaretDownFill";
import style from "./Select.module.scss";
import ProgressCircular from "../../components/ProgressCircular";

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

export interface SelectOutlinedProps {
    name: string;
    options?: Option[];
    onOpenMenu?: OpenMenuHandler,
    label?: string;
}

export default function Select({ 
    options: options_ = [], 
    name, 
    label,
    onOpenMenu: handleOpenMenu,
}: SelectOutlinedProps) {
    const menuRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const caretRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState(options_);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [_, meta, helpers] = useField(name);
    const { value } = meta;
    const { setValue } = helpers;

    const handleMenuChange = (value) => {
        setValue(value);
        setInputValue(options.filter((option) => option.value === value)[0]?.label);
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
    }

    const handleFocus = () => {
        setOpen(true);
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
        setInputValue(event.target.value);
    }

    React.useEffect(() => {
        if (open) {
            if (handleOpenMenu) {
                setLoading(true);
                handleOpenMenu().then(({ loading, error, data }) => {
                    if (error) setError(true);
                    else setOptions(data);
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

    const filteredOptions = options.filter((option) => {
        return option.label.toLowerCase().includes(inputValue.toLowerCase());
    });

    const menuHeight = `${(filteredOptions.length > 4 ? 4 : filteredOptions.length == 0 ? 1 : filteredOptions.length) * 3 + 0.5 * 2}rem`;

    const menu = loading
        ? (
            <div className={style.loadingContainer}>
                <ProgressCircular />
            </div>
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
        );

    return (
        <div className={style.container} >
            <TextFieldOutlined 
                ref={inputRef}
                type="text" 
                value={inputValue}
                name={name} 
                label={label} 
                endIcon={caret}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={handleInputChange}
            />
            {open && menu}
        </div>
    );
}