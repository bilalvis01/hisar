import React from "react";
import clsx from "clsx";

interface MenuContext {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>,
    handleChange?: (value: string) => void;
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
    initialValue: string;
    value: string;
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
    onChange: handleChange, 
    ...props
}, ref) {
    const [uncontrolledValue, setValue] = React.useState(initialValue);
    const value = controlledValue ?? uncontrolledValue;

    const context = React.useMemo(() => ({
        value,
        setValue,
        handleChange,
    }), [value, handleChange]);

    return (
        <MenuContext.Provider value={context}>
            <div {...props} ref={ref} className={clsx("menu", className)}>
                <div className="container">
                    {children}
                </div>
            </div>
        </MenuContext.Provider>
    );
})

interface MenuItemProps {
    children: React.ReactNode,
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    value: string,
}

export function MenuItem({ 
    children, 
    startIcon, 
    endIcon,
    value: thisValue,
}: MenuItemProps) {
    const { value, setValue, handleChange } = useMenuContext();

    const handleClick = () => {
        setValue(thisValue);
        handleChange(thisValue);
    }

    return (
        <button 
            type="button" 
            className={clsx("list-item", { select: value === thisValue })}
            onClick={handleClick}
        >
            <div className="decorator">
                <div className="state-layer" />
            </div>
            {startIcon && (
                <span className="leading-icon">
                    {startIcon}
                </span>
            )}
            <span className="label">
                {children}
            </span>
            {endIcon && (
                <span className="leading-icon">
                    {endIcon}
                </span>
            )}
        </button>
    );
}