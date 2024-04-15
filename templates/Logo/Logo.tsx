import React from "react";
import style from "./Logo.module.scss";
import logo from "./logo.png";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    className?: string;
}

export default function Logo({ className }: LogoProps) {
    return (
        <Link className={className} href="/">
            <Image className={style.logo} src={logo} alt="logo"></Image>
        </Link>
    );
}