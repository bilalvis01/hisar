"use client"

import React from "react";
import clsx from "clsx";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    prefix?: string;
    suffix?: string; 
    supportingText?: string;
    supportingTextSuffix?: string;
}

export default function TextField({
    label,
    startIcon,
    endIcon,
    prefix,
    suffix,
    supportingText,
    supportingTextSuffix,
    placeholder,
    ...props
}: TextFieldProps) {
    const rootRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const inputContainerRef = React.useRef(null);
    const labelRef = React.useRef(null);
    const [text, setText] = React.useState("");
    const [labelBackgroundColor, setLabelBackgroundColor] = React.useState("");
    const [populated, setPopulated] = React.useState(false);
    const [clipLabel, setClipLabel] = React.useState<string | null>(null);
    const hasText = text.length > 0 || (placeholder && placeholder.length > 0);

    function handleFocus() {
        setPopulated(true);
    }

    function handleBlur() {
        setPopulated(hasText);
    }
    
    function handleChange(event) {
        setText(event.target.value);
    }

    function handleClickLabel() {
        if (!populated && inputRef.current instanceof HTMLElement) {
            inputRef.current.focus();
        }
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
            const marginLabel = labelRect.left - rootRect.left;
            const depthClip = labelRect.bottom - rootRect.top;
            setClipLabel(`polygon(
                -${focusIndicatorThickness} -${focusIndicatorThickness}, 
                ${marginLabel}px -${focusIndicatorThickness}, 
                ${marginLabel}px ${depthClip}px, 
                ${marginLabel + labelWidth}px ${depthClip}px, 
                ${marginLabel + labelWidth}px -${focusIndicatorThickness}, 
                calc(${inputContainerWidth}px + ${focusIndicatorThickness}) -${focusIndicatorThickness}, 
                calc(${inputContainerWidth}px + ${focusIndicatorThickness}) calc(${inputContainerHeight}px + ${focusIndicatorThickness}), 
                -${focusIndicatorThickness} calc(${inputContainerHeight}px + ${focusIndicatorThickness}), 
                -${focusIndicatorThickness} -${focusIndicatorThickness}
            )`);
        } else {
            setClipLabel(null);
        }
    }, [populated]);

    return (
        <div ref={rootRef} className={clsx("text-field-outlined", { "populated": populated })}>
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
                                ref={labelRef}
                                className="label" 
                                style={{ backgroundColor: labelBackgroundColor }} 
                                onClick={handleClickLabel}>
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
                            onChange={handleChange} 
                            onFocus={handleFocus} 
                            onBlur={handleBlur} 
                            className="input" 
                            value={text} 
                            placeholder={placeholder}
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
                    <div className="outline-decorator" style={{ clipPath: clipLabel }} />
                </div>
                {supportingText && (
                    <div className="supporting-text-container">
                        <span className="supporting-text">
                            {supportingText}
                        </span>
                        {supportingTextSuffix && (
                            <span className="supporting-text-suffix">
                                {supportingTextSuffix}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}