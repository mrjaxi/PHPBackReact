import React, {useState} from "react";
import Header from "../Components/Header";
import {Col, Typography, Image, Form, Input, Button, Avatar, Upload, Spin, Tooltip} from "antd";
const { Title } = Typography;
import Icon, {UserOutlined, LoadingOutlined} from '@ant-design/icons'
import Camera from "../../../../public/i/camera.svg"
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const Settings = () => {

    const [sendLoading, setSendLoading] = useState(false);
    const [file, setFile] = useState("");
    const [user, setUser] = useState(global.user)

    const onSend = (value) => {
        setSendLoading(true);
        if (file){
            value.image = file
        }

        axios.post(ApiRoutes.API_SET_PROFILE, value).then(response => {
            global.handleResponse(response,
                function () {
                    global.user = response.data?.profile;
                    setUser(response.data?.profile);
                    global.openNotification("Успешно", "Данные сохранены", "success")
                },
                function () {
                    global.openNotification("Ошибка", "Данные не сохранены", "success")
                },
            )
            setFile(value.image)
            setSendLoading(false)
        })
    };

    const props = {
        accept: ".jpeg, .png, .jpg",
        action: ApiRoutes.API_UPLOAD_IMAGE,
        showUploadList: false,
        beforeUpload: (file) => {
            const isPNG = (file.type === 'image/png' | file.type === "image/jpeg");

            if (!isPNG) {
                message.error(`${file?.name} is not a png or jpg file`);
            }

            return isPNG || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            setFile(info.file?.response?.filename);
        },
    };

    return (
        <Col style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
            { user?.id === global.user?.id && <Header/>}
            <div className={"f-login"} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginTop: 100 }}>
                    <Form
                        onFinish={(value) => onSend(value)}
                        name={"settings"}
                        initialValues={user}
                    >
                        <Form.Item
                            name={"image"}
                        >
                            <Title>Настройки</Title>
                            <div className={"t-settings"}>
                                {
                                    user?.image || file ?
                                    <Image
                                        width={260}
                                        height={260}
                                        style={{ borderRadius: 200, objectFit: 'cover',}}
                                        src={file ? file : user?.image}
                                        placeholder={
                                            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                                                <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                            </div>
                                        }
                                    /> : <Avatar size={260} className={"t-avatar"} src={<UserOutlined style={{ fontSize: 60 }}/>} />
                                }
                                <Upload {...props}>
                                    <button type={"button"} className={"t-upload-button"}>
                                        <Icon component={Camera} style={{ fontSize: 23 }} />
                                    </button>
                                </Upload>
                            </div>
                        </Form.Item>
                        <Form.Item
                            name={"first_name"}
                            rules={[
                                {
                                    required: true,
                                    message: 'Пожалуйста, введите имя',
                                },
                            ]}
                        >
                            <Input size={"large"}  style={{ width: 550, padding: 12, marginTop: 15 }} placeholder={"Имя"} />
                        </Form.Item>
                        <Form.Item
                            name={"middle_name"}
                        >
                            <Input size={"large"}  style={{ width: 550, padding: 12 }} placeholder={"Фамилия"} />
                        </Form.Item>
                        <Form.Item
                            name={"last_name"}
                        >
                            <Input size={"large"}  style={{ width: 550, padding: 12 }} placeholder={"Отчество"} />
                        </Form.Item>
                        <Form.Item
                            name={"email"}
                        >
                            <Tooltip placement="topLeft" color={"black"} title="Редактирование почты запрещено">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'not-allowed',
                                }}>
                                    <Input size={"large"} disabled={true} style={{ width: 550, padding: 12 }} placeholder={user.email} />
                                </div>
                            </Tooltip>
                        </Form.Item>
                        <Form.Item
                            name={"phone"}
                            rules={[
                                {
                                    validator(rule, value, callback) {
                                        if (!Number.isInteger(Number(value))) {
                                            callback('Введите номер телефона')
                                        }
                                        if (value.length > 11){
                                            callback('Номер не должен превышать 11 цифр')
                                        }

                                        callback()
                                    },
                                },
                            ]}
                        >
                            <Input size={"large"} style={{ width: 550, padding: 12 }} placeholder={"Номер телефона"} />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                style={{
                                    marginTop: 10,
                                    paddingRight: 27,
                                    paddingLeft: 27,
                                    boxShadow: '0px 16px 32px 4px rgba(61, 114, 237, 0.24)',
                                    borderRadius: 64,
                                    fontSize: 20,
                                    height: 60,
                                }} loading={sendLoading} type="primary" htmlType="submit"
                                shape="round">
                                Сохранить
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Col>
    )
};

export default Settings;