import React from "react";
import style from "./logo.module.scss";
import logo from "./logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Logo({ className }: { className: string }) {
    return (
        <Link className={className} href="/">
            <Image className={style.logo} src={logo} alt="logo"></Image>
        </Link>
    );
}