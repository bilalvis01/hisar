import React from "react";
import clsx from "clsx";
import Check from "../../lib/icons/Check";
import Dash from "../../lib/icons/Dash";
import useMergeRefs from "../../lib/hooks/useMergeRefs";

const Checkbox = React.forwardRef<
    HTMLInputElement,
    { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>
>(function Checkbox({ 
    className, 
    indeterminate, 
    checked: controlledChecked,
    onChange,
    ...props 
}, propRef) {
    const [uncontrolledChecked, setChecked] = React.useState(controlledChecked);
    const checkboxRef = React.useRef(null);
    const ref = useMergeRefs([propRef, checkboxRef]);

    const checked = controlledChecked ?? uncontrolledChecked;

    const handleChange = onChange ?? React.useCallback((event) => {
        if (event.target instanceof HTMLInputElement) setChecked(event.target.checked);
    }, []);

    React.useEffect(() => {
        if (checkboxRef.current instanceof HTMLInputElement) {
            if (indeterminate && !checked) checkboxRef.current.indeterminate = true;
            else checkboxRef.current.indeterminate = false;
        }
    }, [checked, indeterminate]);

    return (
        <div 
            className={clsx(
                "checkbox", 
                { checked },
                { indeterminate }, 
                className,
            )}
        >
            <div className="container">
                <div className="state-layer">
                    <div className="check" />
                </div>
                <div className="icon">
                    {checked 
                        ? <Check />
                        : indeterminate 
                        ? <Dash />
                        : null
                    }
                </div>
                <div className="input">
                    <input {...props} ref={ref} type="checkbox" onChange={handleChange} checked={checked} />
                </div>
            </div>
        </div>
    );
});

export default Checkbox;