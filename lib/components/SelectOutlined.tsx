import React from "react";
import TextFieldOutlined, { TextFieldOutlinedProps } from "./TextFieldOutlined";
import { Menu, MenuItem } from "./Menu";
import IconCaretDownFill from "../icons/CaretDownFill";
import ProgressCircular from "./ProgressCircular";
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

export interface SelectOutlinedProps extends Omit<TextFieldOutlinedProps, "onChange"> {
    options?: Option[];
    onOpenMenu?: OpenMenuHandler;
    value?: string;
    onChange?: (value: string) => void;
}

function Placeholder({ children }: { children: React.ReactNode; }) {
    return (
        <div
            style={{
                display: "grid",
                placeItems: "center",
                position: "absolute",
                width: "100%",
                maxWidth: "100%",
                height: "7rem",
                backgroundColor: "var(--component-menu-container-color)",
                borderRadius: "var(--component-menu-container-shape)",
                boxShadow: "var(-component-menu-container-elevation)",
                zIndex: 2,
            }}
        >
            {children}
        </div>
    );
}

export default function SelectOutlined({ 
    options: options_ = [], 
    name, 
    label,
    onOpenMenu: handleOpenMenu,
    disabled,
    value,
    onChange: setValue,
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
            (menuRef.current && menuRef.current.contains(event.relatedTarget)) || 
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
                onClick={handleClickCaret}
                onMouseDown={handleMouseDown}
                style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    background: "none",
                    border: "none",
                    padding: 0,
                }}
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

    const menuItems = filteredOptions.length > 0
        ? filteredOptions.map((option) => {
            const highlightIndexStart = option.label.search(inputValue);
            const highlightIndexEnd = highlightIndexStart + inputValue.length;
            const highlight = option.label.slice(highlightIndexStart, highlightIndexEnd);
            const first = option.label.slice(0, highlightIndexStart);
            const last = option.label.slice(highlightIndexEnd);

            return (
                <MenuItem key={option.value} value={option.value}>
                    {first}
                    <span style={{ color: "var(--system-color-primary)" }}>
                        {highlight}
                    </span>
                    {last}
                </MenuItem>
            );
        })
        : options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
                {option.label}
            </MenuItem>
        ));

    const menu = loading
        ? (
            <Placeholder>
                <ProgressCircular />
            </Placeholder>
        )
        : error
        ? (
            <Placeholder>
                <span className="text-label-medium">Gagal mengambil data</span>
            </Placeholder>
        )
        : filteredOptions.length == 0 && filtering
        ? (
            <Placeholder>
                <span className="text-label-medium">Pencarian tidak ada</span>
            </Placeholder>
        )
        : (
            <Menu 
                ref={menuRef}
                initialValue={value}
                value={value}
                onChange={handleMenuChange} 
                onMouseDown={handleMouseDown}
                style={{ 
                    position: "absolute",
                    width: "100%",
                    maxWidth: "100%",
                    zIndex: 2,
                    height: menuHeight 
                }}
            >
                {menuItems}
            </Menu>
        );

    return (
        <div style={{ position: "relative" }}>
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
                disabled={disabled}
            />
            {open && menu}
        </div>
    );
}