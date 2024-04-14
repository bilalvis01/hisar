import React from "react";

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
    ...props
}: TextFieldProps) {
    return (
        <div className="text-field-outlined">
            <div className="container">
                <div className="content">
                    <div className="input-container">
                        {startIcon && (
                            <span className="leading-icon">
                                {startIcon}
                            </span>
                        )}
                        <div className="input-container-inner">
                            {prefix && (
                                <span className="prefix">
                                    {prefix}
                                </span>
                            )}
                            <input {...props} className="input" />
                            {suffix && (
                                <span className="suffing">
                                    {suffix}
                                </span>
                            )}
                            {label && (
                                <label className="label">
                                    {label}
                                </label>
                            )}
                        </div>
                        {endIcon && (
                            <span className="trailing-icon">
                                {endIcon}
                            </span>
                        )}
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
        </div>
    );
}