"use client"

import React, { ChangeEvent } from "react";
import clsx from "clsx";
import ExclamationCircleFill from "../icons/ExclamationCircleFill";
import { getLabelClipPathTextFieldOutlined } from "./utils";
import useMergeRefs from "../hooks/useMergeRefs";

export interface TextareaOutlinedProps extends React.HTMLProps<HTMLTextAreaElement> {
    label?: string;
    startIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    prefix?: string;
    suffix?: string; 
    supportingText?: string;
    suffixSupportingText?: string;
    error?: string;
    counter?: boolean | number;
    autoResize?: boolean;
}

const TextareaOutlined = React.forwardRef<
    HTMLTextAreaElement,
    TextareaOutlinedProps
>(function TextareaOutlined({
    label,
    startIcon,
    trailingIcon: propTrailingIcon,
    prefix,
    suffix,
    supportingText: propSupportingText,
    suffixSupportingText: propSuffixSupportingText,
    error,
    counter,
    className,
    placeholder,
    value: controlledValue,
    onFocus: propHandleFocus,
    onChange: propHandleChange,
    onBlur: propHandleBlur,
    autoResize = false,
    ...props
}, propTextareaRef) {
    const id = React.useId();
    const textareaContainerRef = React.useRef(null);
    const labelRef = React.useRef(null);
    const textareaRef = React.useRef(null);
    const setTextareaRef = useMergeRefs([propTextareaRef, textareaRef]);
    const [uncontrolledValue, setUncontrolledValue] = React.useState("");
    const [populated, setPopulated] = React.useState(false);
    const [outlineClipPath, setOutlineClipPath] = React.useState<string | null>(null);
    const [textareaHeight, setTextareaHeight] = React.useState<string | null>(null);

    const value = !!controlledValue ? controlledValue : uncontrolledValue;

    const hasValue = !!value || !!placeholder;

    const supportingText = error ? error : propSupportingText;

    const trailingIcon = !!error ? <ExclamationCircleFill /> : propTrailingIcon;

    const handleChange = React.useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        if (propHandleChange) {
            propHandleChange(event);
        } else {
            setUncontrolledValue(event.target.value);
        }

        if (autoResize && textareaRef.current instanceof HTMLTextAreaElement) {
            const textarea = textareaRef.current;
            const offset = textarea.offsetHeight - textarea.clientHeight;
            const textareaHeight = `${textarea.scrollHeight + offset}px`;
            setTextareaHeight(textareaHeight);
        }
    }, [autoResize]);

    const handleFocus = React.useCallback((event) => {
        propHandleFocus && propHandleFocus(event);
        setPopulated(true);
    }, [propHandleFocus])

    const handleBlur = React.useCallback((event) => {
        propHandleBlur && propHandleBlur(event);
        setPopulated(hasValue);
    }, [propHandleBlur]);

    const handleOutlineStyle = React.useCallback(() => {
        if (
            populated && 
            textareaContainerRef.current instanceof HTMLDivElement && 
            labelRef.current instanceof HTMLLabelElement
        ) {
            const clipPath = getLabelClipPathTextFieldOutlined(textareaContainerRef.current, labelRef.current);
            setOutlineClipPath(clipPath);
        } else {
            setOutlineClipPath(null);
        }
    }, [populated, textareaContainerRef, labelRef]);

    const handleResize = React.useCallback(() => {
        handleOutlineStyle();
    }, [handleOutlineStyle]);

    React.useEffect(() => {
        handleOutlineStyle();
    }, [handleOutlineStyle]);

    React.useEffect(() => {
        if (!(textareaContainerRef.current instanceof HTMLElement)) return null;
        
        const observer = new ResizeObserver(handleResize);

        observer.observe(textareaContainerRef.current);

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
                <div ref={textareaContainerRef} className="textarea-container">
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
                            ref={setTextareaRef}
                            style={{ height: textareaHeight }}
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
                        {trailingIcon && (
                            <span className="trailing-icon">
                                {trailingIcon}
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