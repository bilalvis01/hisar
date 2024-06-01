"use client"

import React, { ChangeEvent } from "react";
import clsx from "clsx";
import ExclamationCircleFill from "../icons/ExclamationCircleFill";

export interface TextareaOutlinedProps extends React.HTMLProps<HTMLTextAreaElement> {
    label?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    prefix?: string;
    suffix?: string; 
    supportingText?: string;
    suffixSupportingText?: string;
    error?: string;
    counter?: boolean | number;
}

const TextareaOutlined = React.forwardRef<
    HTMLTextAreaElement,
    TextareaOutlinedProps
>(function TextareaOutlined({
    label,
    startIcon,
    endIcon: endIcon_,
    prefix,
    suffix,
    supportingText: supportingText_,
    suffixSupportingText: suffixSupportingText_,
    error,
    counter,
    className,
    placeholder,
    value: controlledValue,
    onFocus: externalHandleFocus,
    onChange: externalHandleChange,
    onBlur: externalHandleBlur,
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

    const supportingText = error ?? supportingText_;

    const endIcon = !!error ? <ExclamationCircleFill /> : endIcon_;

    const handleChange = externalHandleChange ?? ((event: ChangeEvent<HTMLTextAreaElement>) => {
        setUncontrolledValue(event.target.value);
    });

    function handleFocus(event) {
        externalHandleFocus && externalHandleFocus(event);
        setPopulated(true);
    }

    function handleBlur(event) {
        externalHandleBlur && externalHandleBlur(event);
        setPopulated(hasValue);
    }

    const handleOutlineStyle = React.useCallback(() => {
        if (populated && inputContainerRef.current instanceof HTMLElement && labelRef.current instanceof HTMLElement) {
            const inputContainer = inputContainerRef.current;
            const label = labelRef.current;
            const inputContainerRect = inputContainer.getBoundingClientRect();
            const labelRect = label.getBoundingClientRect();
            const focusIndicatorThickness = window.getComputedStyle(inputContainer).getPropertyValue("--focus-indicator-thickness");
            const inputContainerWidth = inputContainer.offsetWidth;  
            const inputContainerHeight = inputContainer.offsetHeight; 
            const labelWidth = label.offsetWidth;
            const labelMargin = labelRect.left - inputContainerRect.left;
            const labelSeatDepth = labelRect.bottom - inputContainerRect.top;
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
                "textarea-outlined", 
                { "populated": populated },
                { "error": !!error },
                className,
            )}
        >
            <div className="container">
                <div ref={inputContainerRef} className="textarea-container">
                    <div className="decorator" style={{ clipPath: outlineClipPath }} />
                    {startIcon && (
                        <span className="leading-icon">
                            {startIcon}
                        </span>
                    )}
                    <span className="textarea-container-inner">
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
                        <textarea
                            {...props} 
                            ref={inputRef}
                            id={id}
                            className="textarea"
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
                    </span>
                </div>
                <div className="supporting-text-container">
                    <span className="supporting-text">
                        {supportingText}
                    </span>
                    {counter && (
                        <span className="counter">
                            {typeof counter == "number"
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

export default TextareaOutlined;