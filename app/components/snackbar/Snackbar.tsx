"use client";

import React from "react";
import { 
    Snackbar as SnackbarBase, 
    SupportingText as SnackbarText, 
    IconAction as SnackbarIconAction,
} from "../../../ui/react/Snackbar";
import IconX from "../../../lib/icons/X";
import style from "./Snackbar.module.scss";
import { useTemplateContext } from "../../context/TemplateProvider";

export default function Snackbar() {
    const {
        openSnackbar,
        setOpenSnackbar,
        setInfo,
        info,
        snackbarStyle,
    } = useTemplateContext();

    const handleClose = () => {
        setInfo(null);
        setOpenSnackbar(false);
    };

    React.useEffect(() => {
        let timeoutId;

        if (open) {
            timeoutId =  setTimeout(() => {
                handleClose();
            }, 5000);
        }

        () => clearTimeout(timeoutId);
    }, [openSnackbar]);

    if (!openSnackbar) {
        return;
    }

    return (
        <SnackbarBase style={snackbarStyle} className={style.snackbar}>
            <SnackbarText>{info}</SnackbarText>
            <SnackbarIconAction onClick={handleClose}>
                <IconX />
            </SnackbarIconAction>
        </SnackbarBase>
    );
};