import React from "react";
import clsx from "clsx";
import ProgressCircular from "./ProgressCircular";

interface MenuContext {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>,
    onChange?: (value: string) => void;
}

const MenuContext = React.createContext<MenuContext>(null);

const useMenuContext = () => {
    const context = React.useContext(MenuContext);

    if (context == null) {
        throw new Error("<MenuItem /> must be wrapped in <Menu />");
    }

    return context;
}

type MenuProps = {
    initialValue?: string;
    value?: string;
    onChange?: (value: string) => void | React.Dispatch<React.SetStateAction<string>>;
} & React.HTMLProps<HTMLDivElement>;

export const Menu = React.forwardRef<
    HTMLDivElement,
    MenuProps
>(function Menu({ 
    children, 
    className, 
    initialValue, 
    value: controlledValue,
    onChange,
    ...props
}, ref) {
    const [uncontrolledValue, setValue] = React.useState(initialValue);
    const value = controlledValue ?? uncontrolledValue;

    const context = React.useMemo(() => ({
        value,
        setValue,
        onChange,
    }), [value, onChange]);

    return (
        <MenuContext.Provider value={context}>
            <div {...props} ref={ref} className={clsx("menu", className)}>
                <div className="container">
                    <ul>
                        {children}
                    </ul>
                </div>
            </div>
        </MenuContext.Provider>
    );
})

interface MenuItemProps {
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    value?: string,
    progress?: boolean,
}

export function MenuItem({ 
    children, 
    startIcon, 
    endIcon,
    value: thisValue,
    onClick: handleClick_,
    progress = false,
    ...props
}: MenuItemProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    const { value, setValue, onChange } = useMenuContext();

    const handleClick = (event) => {
        setValue(thisValue);
        if (onChange) onChange(thisValue);
        if (handleClick_) handleClick_(event); 
    }

    return (
        <li>
            <button 
                {...props}
                type="button" 
                className={clsx("list-item", { select: thisValue && value === thisValue })}
                onClick={handleClick}
            >
                <div className="decorator">
                    <div className="state-layer" />
                </div>
                {progress
                    ? (
                        <span className="progress">
                            <ProgressCircular size="sm" />
                        </span>
                    )
                    : startIcon
                    ? (
                        <span className="leading-icon">
                            {startIcon}
                        </span>
                    )
                    : null
                }
                <span className="label">
                    {children}
                </span>
                {endIcon && (
                    <span className="leading-icon">
                        {endIcon}
                    </span>
                )}
            </button>
        </li>
    );
}