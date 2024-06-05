import React from "react";
import clsx from "clsx";
import ProgressCircular from "./ProgressCircular";

interface MenuContext {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
}

const MenuContext = React.createContext<MenuContext>(null);

const useMenuContext = () => {
    const context = React.useContext(MenuContext);

    if (context == null) {
        throw new Error("<MenuItem /> must be wrapped in <Menu />");
    }

    return context;
}

export type MenuProps = {
    value?: string;
    onChange?: (value: string) => void | React.Dispatch<React.SetStateAction<string>>;
} & React.HTMLProps<HTMLDivElement>;

export const Menu = React.forwardRef<
    HTMLDivElement,
    MenuProps
>(function Menu({ 
    children, 
    className,
    value,
    onChange: setValue,
    ...props
}, ref) {
    const context = React.useMemo(() => ({
        value,
        setValue,
    }), [value, setValue]);

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

export interface MenuItemProps {
    startIcon?: React.ReactNode,
    endIcon?: React.ReactNode,
    value?: string,
    progress?: boolean,
}

export function MenuItem({ 
    children, 
    startIcon, 
    endIcon,
    value: propValue,
    onClick: propHandleClick,
    progress = false,
    ...props
}: MenuItemProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    const { value, setValue } = useMenuContext();

    const handleClick = (event) => {
        if (setValue) setValue(propValue);
        if (propHandleClick) propHandleClick(event); 
    }

    return (
        <li>
            <button 
                {...props}
                type="button" 
                className={clsx("list-item", { select: propValue && value === propValue })}
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