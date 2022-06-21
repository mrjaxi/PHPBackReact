import React, {useState} from "react";
import {Avatar, Button, Form, Input, Modal} from "antd";
import {Typography} from 'antd';
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const {Title} = Typography;

import {useTimer} from 'react-timer-hook';

function AccessTimer({expiryTimestamp, setTimeExpiry}) {
    const {
        seconds,
        minutes,
    } = useTimer({expiryTimestamp, onExpire: () => { setTimeExpiry(false) }});


    return (
        <>
            <span>Повторно отправить можно через {minutes}</span>:<span>{seconds < 10 ? `0${seconds}` : seconds}</span>
        </>
    );
}


const Login = ({visible, setVisible}) => {

    const [timeExpiry, setTimeExpiry] = useState(false);

    const loginUser = (data) => {
        if (!timeExpiry) {
            // TODO: Поменять вход
            axios.post(ApiRoutes.API_SIGN_IN,   // ApiRoutes.API_SIGN_IN     || ApiRoutes.API_LOGIN
                {username: data?.email,},  // {username: data?.email,}, || global.serialize({username: data?.email, password: data?.password}),
                {withCredentials: true,})
                .then(response => {
                    const time = new Date();
                    let seconds
                    switch (response.data?.state) {
                        case "trouble": // провал в кейс success
                        case "success":
                            global.openNotification("Успешно", "Ссылка для входа отправлена на вашу почту", "success")
                            seconds = time.getSeconds() + response.data?.seconds
                            setTimeExpiry(time.setSeconds(seconds));
                            break;
                        // global.user = response.data.profile;
                        // global._history.replace("/")
                        case "timer":
                            global.openNotification("Предупреждение", response.data?.message, "warn")
                            seconds = time.getSeconds() + response.data?.seconds
                            setTimeExpiry(time.setSeconds(seconds));
                            break;
                        case "error":
                            global.openNotification("Ошибка", response.data?.message, "error")
                            break;
                        default:
                            global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                            break;
                    }
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
                width={"100vw"}
                style={{
                    height: '100vh',
                }}
                footer={null}
            >
                <div className={"f-login"}>
                    <a onClick={() => setVisible(!visible)}
                       style={{position: 'absolute', top: 30, right: 30, height: 25, width: 25}}>
                        <img src={"/i/close-login.svg"} alt={"Вернуться в главное меню"}/>
                    </a>
                    <Form
                        onFinish={(values) => loginUser(values)}
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

                                        if (timeExpiry){
                                            callback(<AccessTimer callback={callback} setTimeExpiry={setTimeExpiry} expiryTimestamp={timeExpiry}/>)
                                        }

                                        callback()
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
                        {/*    <Input.Password size={"large"} style={{ padding: '10px 15px 10px 15px', width: '440px' }} placeholder={"Пароль"}/>*/}
                        {/*</Form.Item>*/}
                        <Form.Item>
                            <Button className={"f-login-btn"} type="primary" htmlType="submit"
                                    shape="round">
                                Отправить
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </>
    )
};

export default Login;
