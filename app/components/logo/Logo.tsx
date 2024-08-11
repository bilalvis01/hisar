import React from "react";
import style from "./Logo.module.scss";
import logo from "./logo.png";
import Image from "next/image";

export default function Logo() {
    return (
        <Image className={style.logo} src={logo} alt="logo"></Image>
    );
}