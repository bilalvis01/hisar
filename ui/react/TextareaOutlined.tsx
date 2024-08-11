"use client"

import React, { ChangeEvent } from "react";
import clsx from "clsx";
import ExclamationCircleFill from "../../lib/icons/ExclamationCircleFill";
import { getLabelClipPathTextFieldOutlined } from "./utils";
import useMergeRefs from "../../lib/hooks/useMergeRefs";

export interface TextareaOutlinedProps extends React.HTMLProps<HTMLTextAreaElement> {
    value?: string;
    label?: string;
    startIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    prefix?: string;
    suffix?: string; 
    supportingText?: string;
    suffixSupportingText?: string;
    error?: string;
    counter?: boolean | number;
    autosize?: boolean;
    minRows?: number;
    maxRows?: number;
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
    value: controlledValue = "",
    onFocus: propHandleFocus,
    onChange: propHandleChange,
    onBlur: propHandleBlur,
    autosize = true,
    minRows = 2,
    maxRows,
    rows: propRows,
    cols,
    ...props
}, propTextareaRef) {
    const id = React.useId();
    const [uncontrolledValue, setUncontrolledValue] = React.useState("");
    const value = !!controlledValue ? controlledValue : uncontrolledValue;
    const textareaContainerRef = React.useRef(null);
    const labelRef = React.useRef(null);
    const textareaRef = React.useRef(null);
    const shadowTextareaRef = React.useRef(null);
    const setTextareaRef = useMergeRefs([propTextareaRef, textareaRef]);
    const [populated, setPopulated] = React.useState(false);
    const [outlineClipPath, setOutlineClipPath] = React.useState<string | null>(null);
    const [rowsDict, setRowsDict] = React.useState<
        { [index: number]: number }
    >(() => {
        if (value.length > 0) {
            return {
                0: minRows,
                [value.length]: minRows,
            }
        }

        return {
            0: minRows
        };
    });

    const lookupRows = rowsDict[value.length];
    /*
    const rows = propRows
        ? propRows
        : (lookupRows && lookupRows < minRows) || !lookupRows 
        ? minRows
        : lookupRows && ((maxRows && lookupRows >= minRows && lookupRows < maxRows) || !maxRows)
        ? lookupRows
        : maxRows;
    */
    const rows = propRows ? propRows : lookupRows;

    const hasValue = !!value || !!placeholder;

    const supportingText = error ? error : propSupportingText;

    const trailingIcon = !!error ? <ExclamationCircleFill /> : propTrailingIcon;

    const handleAutosize = React.useCallback((newValue: string) => {
        if (
            autosize
            && !propRows
            && newValue.length > 0
            && textareaRef.current instanceof HTMLTextAreaElement
            && shadowTextareaRef.current instanceof HTMLSpanElement
            && textareaRef.current.clientHeight > 0
            && shadowTextareaRef.current.clientHeight > 0
        ) {
            const shadowTextareaClientHeight = shadowTextareaRef.current.clientHeight;
            const textareaClientHeight = textareaRef.current.clientHeight;

            if (newValue.length > value.length) {
                const lowerRowsEntriesRelativeToNewValueLength = Object.entries(rowsDict)
                    .filter((entry) => parseInt(entry[0]) < value.length);
                const maxLowerRowsRelativeToNewValueLength = Math.max(
                    ...lowerRowsEntriesRelativeToNewValueLength.map((entry) => entry[1])
                );
                const rows = Number.isInteger(maxLowerRowsRelativeToNewValueLength)
                    ? maxLowerRowsRelativeToNewValueLength
                    : minRows;

                console.log(rows);

                setRowsDict({
                    ...rowsDict,
                    [newValue.length]: rows,
                });
            }

            if (
                newValue.length < value.length
                && !rowsDict[newValue.length]
            )  {
                const uppderRowsEntriesRelativeToNewValueLength = Object.entries(rowsDict)
                    .filter((entry) => parseInt(entry[0]) > newValue.length);
            
                const minUpperRowsRelativeToNewValueLength = Math.min(
                    ...uppderRowsEntriesRelativeToNewValueLength.map((entry) => entry[1])
                );

                const rows = Number.isInteger(minUpperRowsRelativeToNewValueLength)
                    ? minUpperRowsRelativeToNewValueLength
                    : minRows;

                setRowsDict({
                    ...rowsDict,
                    [newValue.length]: rows,
                });
            }

            if (rowsDict[newValue.length]) {
                if ( 
                    textareaClientHeight < shadowTextareaClientHeight
                    && (
                        (maxRows && rowsDict[newValue.length] < maxRows) || !maxRows
                    )
                ) {
                    setRowsDict({
                        ...rowsDict,
                        [newValue.length]: rowsDict[newValue.length] + 1
                    });
                }
    
                if (
                    textareaClientHeight > shadowTextareaClientHeight
                    && rowsDict[newValue.length] > minRows
                ) {
                    console.log("test");
                    setRowsDict({
                        ...rowsDict,
                        [newValue.length]: rowsDict[newValue.length] - 1
                    });
                }
            }
        }
    }, [autosize, value, rowsDict, propRows, minRows, maxRows]);

    const handleChange = React.useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;

        if (propHandleChange) {
            propHandleChange(event);
        } else {
            setUncontrolledValue(value);
        } 

        handleAutosize(value);
    }, [propHandleChange, handleAutosize]);

    const handleFocus = React.useCallback((event) => {
        propHandleFocus && propHandleFocus(event);
        setPopulated(true);
    }, [propHandleFocus])

    const handleBlur = React.useCallback((event) => {
        propHandleBlur && propHandleBlur(event);
        setPopulated(hasValue);
    }, [propHandleBlur, hasValue]);

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

    React.useEffect(() => {
        handleAutosize(value);
    }, [handleAutosize, value]);

    return (
        <div 
            className={clsx(
                "textarea-outlined", 
                { "populated": populated },
                { "error": !!error },
                { "trailing-icon": !!trailingIcon },
                className,
            )}
        >
            <div className="container">
                <div className="shadow-textarea-container">
                    {startIcon && (
                        <span className="shadow-leading-icon">
                            {startIcon}
                        </span>
                    )}
                    <span className="shadow-textarea-container-inner">
                        {prefix && (
                            <span className="shadow-prefix">
                                {prefix}
                            </span>
                        )}
                        <span ref={shadowTextareaRef} className="shadow-textarea">
                            {value}
                        </span>
                        {suffix && (
                            <span className="shadow-suffix">
                                {suffix}
                            </span>
                        )}
                    </span>
                    {trailingIcon && (
                        <span className="shadow-trailing-icon">
                            {trailingIcon}
                        </span>
                    )}
                </div>
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
                            id={id}
                            className="textarea"
                            value={value}
                            cols={cols}
                            rows={rows}
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
                        <span className="trailing-icon">
                            {trailingIcon}
                        </span>
                    )}
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