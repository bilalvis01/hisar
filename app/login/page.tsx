"use client";

import React from "react";
import style from "./login.module.scss";
import { signIn } from "next-auth/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextField from "../components/text-field/TextField";
import ButtonFilled from "../../ui/react/ButtonFIlled";
import clsx from "clsx";

export default function Login() {
    return (
        <div className={style.app}>
            <div className={style.card}>
                <h2 className={clsx(style.header, "text-headline-small")}>
                    Login
                </h2>
                <div className={style.body}>
                    <Formik
                        initialValues={{ username: "", password: "" }}
                        validationSchema={Yup.object({
                            username: Yup.string()
                                .required("Username tidak boleh kosong"),
                            password: Yup.string()
                                .required("Password tidak boleh kosong")
                                .min(8, "Password minimal 8 karakter"),
                        })}
                        enableReinitialize={true}
                        onSubmit={(data) => {
                            signIn("credentials", { ...data });
                        }}
                    >
                        <Form>
                            <TextField name="username" label="Username" type="text" />
                            <TextField name="password" label="Password" type="password" />
                            <ButtonFilled className={style.button}>Login</ButtonFilled>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    )
}