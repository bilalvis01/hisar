"use client"

import React, { ChangeEvent } from "react";
import clsx from "clsx";
import ExclamationCircleFill from "../icons/ExclamationCircleFill";
import { getLabelClipPathTextFieldOutlined } from "./utils";

export interface TextFieldOutlinedProps extends React.HTMLProps<HTMLInputElement> {
    label?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    prefix?: string;
    suffix?: string; 
    supportingText?: string;
    suffixSupportingText?: string;
    error?: string;
    counter?: boolean | number;
    onClickLeadingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onDoubleClickLeadingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseDownLeadingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseUpLeadingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onClickTrailingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onDoubleClickTrailingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseDownTrailingIcon?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseUpTrailingIcon?: React.MouseEventHandler<HTMLButtonElement>;
}

const TextFieldOulined = React.forwardRef<
    HTMLInputElement,
    TextFieldOutlinedProps
>(function TextFieldOutlined({
    label,
    leadingIcon,
    trailingIcon: propTrailingIcon,
    prefix,
    suffix,
    supportingText: propSupportingText,
    suffixSupportingText: propSuffixSupportingText,
    error,
    counter,
    className,
    type,
    placeholder,
    value: controlledValue,
    onClickLeadingIcon: handleClickLeadingIcon,
    onDoubleClickLeadingIcon: handleDoubleClickLeadingIcon,
    onMouseDownLeadingIcon: handleMouseDownLeadingIcon,
    onMouseUpLeadingIcon: handleMouseUpLeadingIcon,
    onClickTrailingIcon: handleClickTrailingIcon,
    onDoubleClickTrailingIcon: handleDoubleClickTrailingIcon,
    onMouseDownTrailingIcon: handleMouseDownTrailingIcon,
    onMouseUpTrailingIcon: handleMouseUpTralingIcon,
    onFocus: propHandleFocus,
    onChange: propHandleChange,
    onBlur: propHandleBlur,
    ...props
}, inputRef) {
    const id = React.useId();
    const inputContainerRef = React.useRef(null);
    const labelRef = React.useRef(null);
    const [uncontrolledValue, setUncontrolledValue] = React.useState("");
    const [populated, setPopulated] = React.useState(false);
    const [outlineClipPath, setOutlineClipPath] = React.useState<string | null>(null);

    const value = !!controlledValue ? controlledValue : uncontrolledValue;

    const hasValue = !!value || !!placeholder;

    const supportingText = error ? error : propSupportingText;

    const trailingIcon = !!error ? <ExclamationCircleFill /> : propTrailingIcon;

    const handleChange = propHandleChange ?? ((event: ChangeEvent<HTMLInputElement>) => {
        setUncontrolledValue(event.target.value);
    });

    function handleFocus(event) {
        if (propHandleFocus && typeof propHandleFocus === "function") {
            propHandleFocus(event);
        }
        setPopulated(true);
    }

    function handleBlur(event) {
        if (propHandleBlur && typeof propHandleBlur === "function") {
            propHandleBlur(event);
        }
        setPopulated(hasValue);
    }

    const handleOutlineStyle = React.useCallback(() => {
        if (
            populated && 
            inputContainerRef.current instanceof HTMLDivElement && 
            labelRef.current instanceof HTMLLabelElement
        ) {
            const clipPath = getLabelClipPathTextFieldOutlined(inputContainerRef.current, labelRef.current);
            setOutlineClipPath(clipPath);
        } else {
            setOutlineClipPath(null);
        }
    }, [populated, inputContainerRef, labelRef]);

    const handleResize = React.useCallback(() => {
        handleOutlineStyle();
    }, [handleOutlineStyle]);

    React.useEffect(() => {
        handleOutlineStyle();
    }, [handleOutlineStyle]);

    React.useEffect(() => {
        if (!(inputContainerRef.current instanceof HTMLElement)) return null;
        
        const observer = new ResizeObserver(handleResize);

        observer.observe(inputContainerRef.current);

        return () => observer.disconnect();
    }, [handleResize]);

    React.useEffect(() => {
        setPopulated(hasValue);
    }, [hasValue]);

    return (
        <div 
            className={clsx(
                "text-field-outlined", 
                { "populated": populated },
                { "error": !!error },
                className,
            )}
        >
            <div className="container">
                <div ref={inputContainerRef} className="input-container">
                    <div className="decorator" style={{ clipPath: outlineClipPath }} />
                    {leadingIcon && (
                        <button 
                            type="button" 
                            className="leading-icon"
                            onClick={handleClickLeadingIcon}
                            onDoubleClick={handleDoubleClickLeadingIcon}
                            onMouseDown={handleMouseDownLeadingIcon}
                            onMouseUp={handleMouseUpLeadingIcon}
                        >
                            {leadingIcon}
                        </button>
                    )}
                    <span className="input-container-inner">
                        {label && (
                            <label 
                                htmlFor={id}
                                ref={labelRef}
                                className="label"
                            >
                                {label}
                            </label>
                        )}
                        {prefix && (
                            <span className="prefix">
                                {prefix}
                            </span>
                        )}
                        <input 
                            {...props} 
                            ref={inputRef}
                            id={id}
                            className="input"
                            type={type} 
                            value={value} 
                            placeholder={placeholder}
                            onChange={handleChange} 
                            onFocus={handleFocus} 
                            onBlur={handleBlur} 
                        />
                        {suffix && (
                            <span className="suffix">
                                {suffix}
                            </span>
                        )}
                    </span>
                    {trailingIcon && (
                        <button 
                            type="button" 
                            className="trailing-icon"
                            onClick={handleClickTrailingIcon}
                            onDoubleClick={handleDoubleClickTrailingIcon}
                            onMouseDown={handleMouseDownTrailingIcon}
                            onMouseUp={handleMouseUpTralingIcon}
                        >
                            {trailingIcon}
                        </button>
                    )}
                </div>
                <div className="supporting-text-container">
                    <span className="supporting-text">
                        {supportingText}
                    </span>
                    {counter && (
                        <span className="counter">
                            {typeof counter == "number" && (type == "text" || type == "password")
                                ? `${(value as string).length}/${counter}`
                                : (value as string).length
                            }
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

export default TextFieldOulined;