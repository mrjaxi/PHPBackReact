import React from "react";
import {Button, Checkbox, Form, Input} from "antd";
import {NavLink} from "react-router-dom";

const Login = () => {
    return (
        <>
            <div className={"f-login"}>
                <NavLink to={""} className={"f-login-close-btn"} />
                <div className={"f-login-wrap"}>
                    <span className={"f-login-text"}>Вход</span>
                    <form>
                        <div className={"f-login-wrap"}>
                            <input className={"f-login-input"} placeholder={"Электронная почта"}/>
                            <input className={"f-login-input"} placeholder={"Пароль"}/>
                            <div className={"f-login-center"}>
                                <input className={"f-login-checkbox-btn"} name={"checkbox"} type={"checkbox"}/>
                                <label className={"f-login-checkbox"} htmlFor={"checkbox"}>Запомнить меня</label>
                            </div>
                            <a className={"f-login-btn"} href={"#"}>Войти</a>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
};

export default Login;