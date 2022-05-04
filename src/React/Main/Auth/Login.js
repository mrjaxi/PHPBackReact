import React from "react";
import {Button, Checkbox, Form, Input} from "antd";
import { Typography } from 'antd';
const { Title } = Typography;

const Login = () => {
    return (
        <>
            <div className={"f-login"}>
                <Form>
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
                        <Checkbox style={{ fontSize: 19 }}>Запомнить меня</Checkbox>
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