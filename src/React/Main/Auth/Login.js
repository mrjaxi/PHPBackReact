import React, {useState} from "react";
import {Button, Form, Input} from "antd";
import { Typography } from 'antd';
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
const { Title } = Typography;

import { useTimer } from 'react-timer-hook';

function AccessTimer({ expiryTimestamp, setTimeExpiry }) {
    const {
        seconds,
        minutes,
    } = useTimer({ expiryTimestamp, onExpire: () => setTimeExpiry(false)});


    return (
        <>
            <span> {minutes}</span>:<span>{seconds}</span>
        </>
    );
}


const Login = () => {

    const time = new Date();
    const [timeExpiry, setTimeExpiry] = useState(false);

    const loginUser = (data) => {
        if (!timeExpiry){
            axios.post(ApiRoutes.API_SIGN_IN, {username: data?.email}, {withCredentials: true,}).then(response => {
                if (response.data.state === "success"){
                    global.user = response.data.profile;
                    global.openNotification("Успешно", "Ссылка для входа отправлена на вашу почту", "success")

                    global._history.push("/")
                } else if (response.data.state === "timer"){
                    setTimeExpiry(time.setSeconds(time.getSeconds() + response.data.seconds));
                } else {
                    global.openNotification("Ошибка", "Неверные данные для входа", "error")
                }
            })
        }
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
                    {/*<Form.Item*/}
                    {/*    name={"password"}*/}
                    {/*    rules={[*/}
                    {/*        {*/}
                    {/*            required: true,*/}
                    {/*            message: 'Пожалуйста, введите пароль',*/}
                    {/*        },*/}
                    {/*    ]}*/}
                    {/*>*/}
                    {/*    <Input.Password size={"large"} style={{ padding: '10px 15px 10px 15px', width: '440px' }} placeholder={"Пароль"}/>*/}
                    {/*</Form.Item>*/}
                    <Form.Item>
                        <Button disabled={timeExpiry} className={"f-login-btn"} type="primary" htmlType="submit" shape="round">Отправить на почту{ timeExpiry && <>
                        <span>&nbsp;повторно&nbsp;</span><AccessTimer setTimeExpiry={setTimeExpiry} expiryTimestamp={timeExpiry}/></> }</Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default Login;