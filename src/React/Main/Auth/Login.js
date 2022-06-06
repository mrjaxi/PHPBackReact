import React, {useState} from "react";
import {Button, Form, Input} from "antd";
import { Typography } from 'antd';
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
const { Title } = Typography;

const Login = () => {

    const loginUser = (data) => {
        axios.post(ApiRoutes.API_SIGN_IN, {username: data?.email, password: data?.password}, {withCredentials: true,}).then(response => {
            if (response.data.state === "success"){
                global.user = response.data.profile;
                global.openNotification("Успешно", "Ссылка для входа отправлена на вашу почту", "success")

                global._history.push("/")
            } else {
                global.openNotification("Ошибка", "Неверные данные для входа", "error")
            }
        })
    };

    return (
        <>
            <div className={"f-login"}>
                <a onClick={() => global._history.replace("/")} style={{ position: 'absolute', top: 30, right: 30, height: 25, width: 25 }} >
                    <img src={"/i/close-login.svg"} />
                </a>
                <Form
                    onFinish={(values) => loginUser(values)}
                >
                    <Title style={{ marginBottom: 48 }}>Вход</Title>
                    <Form.Item
                        name={"email"}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, укажите адрес электронной почты',
                            },
                        ]}
                    >
                        <Input size={"large"} style={{ padding: '10px 15px 10px 15px', width: '440px' }} placeholder={"Электронная почта"}/>
                    </Form.Item>
                    <Form.Item
                        name={"password"}
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста, введите пароль',
                            },
                        ]}
                    >
                        <Input.Password size={"large"} style={{ padding: '10px 15px 10px 15px', width: '440px' }} placeholder={"Пароль"}/>
                    </Form.Item>
                    <Form.Item>
                        <Button className={"f-login-btn"} type="primary" htmlType="submit" shape="round">Войти</Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default Login;