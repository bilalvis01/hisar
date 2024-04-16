"use client"

import React from "react";
import clsx from "clsx";
import ExclamationCircleFill from "../icons/ExclamationCircleFill";

export interface TextFieldOutlinedProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    prefix?: string;
    suffix?: string; 
    supportingText?: string;
    suffixSupportingText?: string;
    error?: string;
    inputMax?: number;
}

export default function TextFieldOutlined({
    label,
    startIcon,
    endIcon: endIcon_,
    prefix,
    suffix,
    supportingText: supportingText_,
    suffixSupportingText: suffixSupportingText_,
    error,
    inputMax,
    className,
    type,
    placeholder,
    value: controlledValue,
    onChange: externalHandleChange,
    onBlur: externalHandleBlur,
    ...props
}: TextFieldOutlinedProps) {
    const id = React.useId();
    const rootRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const inputContainerRef = React.useRef(null);
    const labelRef = React.useRef(null);
    const [uncontrolledValue, setUncontrolledValue] = React.useState("");
    const [populated, setPopulated] = React.useState(false);
    const [outlineStyle, setOutlineStyle] = React.useState<React.CSSProperties | null>(null);

    const value = controlledValue ?? uncontrolledValue;

    const hasValue = !!value || (placeholder && placeholder.length > 0);

    const supportingText = error ?? supportingText_;

    const suffixSupportingText = inputMax ?? suffixSupportingText_;

    const endIcon = !!error ? <ExclamationCircleFill /> : endIcon_;


    const handleChange = externalHandleChange ?? ((event) => setUncontrolledValue(event.target.value));

    function handleFocus() {
        setPopulated(true);
    }

    function handleBlur(event) {
        externalHandleBlur && externalHandleBlur(event);
        setPopulated(hasValue);
    }

    React.useEffect(() => {
        if (populated && rootRef.current instanceof HTMLElement && inputContainerRef.current instanceof HTMLElement && labelRef.current instanceof HTMLElement) {
            const root = rootRef.current;
            const inputContainer = inputContainerRef.current;
            const label = labelRef.current;
            const rootRect = root.getBoundingClientRect();
            const labelRect = label.getBoundingClientRect();
            const focusIndicatorThickness = window.getComputedStyle(root).getPropertyValue("--focus-indicator-thickness");
            const inputContainerWidth = inputContainer.offsetWidth;  
            const inputContainerHeight = inputContainer.offsetHeight; 
            const labelWidth = label.offsetWidth;
            const labelMargin = labelRect.left - rootRect.left;
            const labelSeatDepth = labelRect.bottom - rootRect.top;
            const clipPath = `polygon(
                -${focusIndicatorThickness} -${focusIndicatorThickness}, 
                ${labelMargin}px -${focusIndicatorThickness}, 
                ${labelMargin}px ${labelSeatDepth}px, 
                ${labelMargin + labelWidth}px ${labelSeatDepth}px, 
                ${labelMargin + labelWidth}px -${focusIndicatorThickness}, 
                calc(${inputContainerWidth}px + ${focusIndicatorThickness}) -${focusIndicatorThickness}, 
                calc(${inputContainerWidth}px + ${focusIndicatorThickness}) calc(${inputContainerHeight}px + ${focusIndicatorThickness}), 
                -${focusIndicatorThickness} calc(${inputContainerHeight}px + ${focusIndicatorThickness}), 
                -${focusIndicatorThickness} -${focusIndicatorThickness}
            )`;
            setOutlineStyle({ clipPath });
        } else {
            setOutlineStyle(null);
        }
    }, [populated]);

    return (
        <div 
            ref={rootRef} 
            className={clsx(
                "text-field-outlined", 
                { "populated": populated },
                { "error": !!error },
                className,
            )}
        >
            <div className="container">
                <div ref={inputContainerRef} className="input-container">
                    {startIcon && (
                        <span className="leading-icon">
                            {startIcon}
                        </span>
                    )}
                    <div className="input-container-inner">
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
                        {endIcon && (
                            <span className="trailing-icon">
                                {endIcon}
                            </span>
                        )}
                    </div>
                    <div className="outline-decorator" style={outlineStyle} />
                </div>
                <div className="supporting-text-container">
                    <span className="supporting-text">
                        {supportingText}
                    </span>
                    {suffixSupportingText && (
                        <span className="supporting-text-suffix">
                            {typeof inputMax == "number" && type == "text"
                                ? `${(value as string).length}/${inputMax}`
                                : suffixSupportingText
                            }
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}