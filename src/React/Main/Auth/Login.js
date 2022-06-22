import React, {useEffect, useRef, useState} from "react";
import {Avatar, Button, Form, Input, Modal, Result} from "antd";
import {Typography} from 'antd';
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const {Title} = Typography;

import {useTimer} from 'react-timer-hook';

function AccessTimer({expiryTimestamp, setTimeExpiry, setBlockButton}) {
    const {
        seconds,
        minutes,
    } = useTimer({expiryTimestamp, onExpire: () => {
        setTimeExpiry(false), setBlockButton(false)
    }});

    return (
        <>
            <span>Повторно отправить можно через {minutes}</span>:<span>{seconds < 10 ? `0${seconds}` : seconds}</span>
        </>
    );
}


const Login = ({visible, setVisible}) => {

    const inputRef = useRef(null);
    const [timeExpiry, setTimeExpiry] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [blockButton, setBlockButton] = useState(false);

    const loginUser = (data) => {
        if (!timeExpiry) {
            setLoading(true);
            // TODO: Поменять вход
            axios.post(ApiRoutes.API_SIGN_IN,   // ApiRoutes.API_SIGN_IN     || ApiRoutes.API_LOGIN
                {username: data?.email,}, // {username: data?.email,}, || global.serialize({username: data?.email, password: data?.password}),
                {withCredentials: true,})
                .then(response => {
                    const time = new Date();
                    let seconds
                    switch (response.data?.state) {
                        case "trouble": // провал в кейс success
                        case "success":
                            seconds = time.getSeconds() + response.data?.seconds;
                            setTimeExpiry(time.setSeconds(seconds));
                            setIsSent(true);
                            setBlockButton(false);
                            break;
                        case "timer":
                            seconds = time.getSeconds() + response.data?.seconds;
                            setTimeExpiry(time.setSeconds(seconds));
                            setBlockButton(true);
                            inputRef.current.validateFields();
                            break;
                        case "error":
                            global.openNotification("Ошибка", response.data?.message, "error")
                            break;
                        default:
                            global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                            break;
                    }
                    setLoading(false)
                })
        }
    };

    return (
        <>
            <Modal
                centered
                closable={false}
                visible={visible}
                onOk={() => setVisible(false)}
                onCancel={() => setVisible(false)}
                destroyOnClose={true}
                width={"100vw"}
                style={{
                    height: '100vh',
                }}
                footer={null}
            >
                {
                    isSent ?
                        <div style={{ minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <a onClick={() =>
                            {
                                setIsSent(false)
                                setTimeExpiry(false)
                                setVisible(!visible)
                            }}
                               style={{position: 'absolute', top: 30, right: 30, height: 25, width: 25}}>
                                <img src={"/i/close-login.svg"} alt={"Вернуться в главное меню"}/>
                            </a>
                            <Result
                                status="success"
                                title="Письмо успешно отправлено на почту!"
                            />
                        </div>
                         :
                        <div className={"f-login"}>
                            <a onClick={() => setVisible(!visible)}
                               style={{position: 'absolute', top: 30, right: 30, height: 25, width: 25}}>
                                <img src={"/i/close-login.svg"} alt={"Вернуться в главное меню"}/>
                            </a>
                            <Form
                                onFinish={(values) => loginUser(values)}
                                ref={inputRef}
                            >
                                <Title style={{marginBottom: 48}}>Вход</Title>
                                <Form.Item
                                    name={"email"}
                                    rules={[
                                        {
                                            required: true,
                                            validator(rule, value, callback) {
                                                if (!value) {
                                                    callback('Пожалуйста, укажите адрес электронной почты')
                                                }

                                                if (value && timeExpiry === false){
                                                    callback()
                                                }

                                                callback(<AccessTimer
                                                    ref={inputRef}
                                                    setBlockButton={setBlockButton}
                                                    setTimeExpiry={setTimeExpiry}
                                                    expiryTimestamp={timeExpiry}/>)
                                            }
                                        },
                                    ]}
                                >
                                    <Input size={"large"} style={{padding: '10px 15px 10px 15px', width: '440px'}}
                                           placeholder={"Электронная почта"}/>
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
                                {/*    <Input.Password size={"large"}*/}
                                {/*                    style={{padding: '10px 15px 10px 15px', width: '440px'}}*/}
                                {/*                    placeholder={"Пароль"}/>*/}
                                {/*</Form.Item>*/}
                                <Form.Item>
                                    <Button
                                        style={{
                                            paddingRight: 27,
                                            paddingLeft: 27,
                                            boxShadow: blockButton ? '0px 16px 32px 4px rgba(61, 114, 237, 0.24)' : 'none',
                                            borderRadius: 64,
                                            fontSize: 20,
                                            height: 60,
                                        }}
                                        disabled={blockButton} loading={loading} type="primary" htmlType="submit"
                                            shape="round">
                                        Отправить
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                }
            </Modal>
        </>
    )
};

export default Login;
