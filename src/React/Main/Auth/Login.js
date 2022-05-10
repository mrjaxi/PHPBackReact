import React, {useState} from "react";
import {Button, Checkbox, Form, Input} from "antd";
import { Typography } from 'antd';
import axios from "axios";
const { Title } = Typography;

const Login = () => {

    const [checked, setChecked] = useState(false);

    const loginUser = (data) => {
        axios.post("http://127.0.0.1:8000/ru/login", global.serialize({username: data?.email, password: data?.password, remember: checked}), {withCredentials: true,}).then(response => {
            if (response.data.state === "success"){
                global.user = response.data.profile
            }
        })
    };

    return (
        <>
            <div className={"f-login"}>
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
                    <Form.Item
                        name={"remember"}
                    >
                        <Checkbox onChange={() => setChecked(!checked)} style={{ fontSize: 19 }}>Запомнить меня</Checkbox>
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