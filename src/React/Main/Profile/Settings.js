import React, {useState} from "react";
import Header from "../Components/Header";
import {Col, Typography, Image, Form, Input, Button, Avatar, Upload} from "antd";
const { Title } = Typography;
import Icon, {UserOutlined} from '@ant-design/icons'
import Camera from "../../../../public/i/camera.svg"
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const Settings = () => {

    const [loading, setLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false)
    const [file, setFile] = useState("");

    const onSend = (value) => {
        setSendLoading(true);
        if (file){
            value.image = file
        }

        axios.post(ApiRoutes.API_SET_PROFILE, value).then(response => {
            console.log(response);
            setSendLoading(false)
        })
    };

    const props = {
        accept: ".jpeg, .png, .jpg",
        action: ApiRoutes.API_UPLOAD_IMAGE,
        showUploadList: false,
        beforeUpload: (file) => {
            setLoading(true);
            const isPNG = (file.type === 'image/png' | file.type === "image/jpeg");

            if (!isPNG) {
                message.error(`${file.name} is not a png or jpg file`);
            }

            return isPNG || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            setFile(info.file?.response?.filename);
            if(info.file?.response?.filename){
                console.log(info.file?.response?.filename)
                global.user.image = info.file?.response?.filename
                setLoading(false);
            }
        },
    };

    return (
        <Col style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
            <Header/>
            <div className={"f-login"} style={{ display: 'flex', flexDirection: 'column', paddingBottom: 95 }}>
                <div style={{ marginTop: 120 }}>
                    <Form
                        onFinish={(value) => onSend(value)}
                        name={"settings"}
                        initialValues={global.user}
                        style={{ marginTop: 40 }}
                    >
                        <Form.Item
                            name={"image"}
                        >
                            <Title>Настройки</Title>
                            <div className={"t-settings"}>
                                {
                                    global.user?.image || file ?
                                        <Image
                                            width={260}
                                            height={260}
                                            style={{ borderRadius: 200, objectFit: 'cover' }}
                                            src={file ? file : global.user?.image}
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
                            <Input size={"large"}  style={{ width: 550, padding: 12 }} placeholder={"Имя"} />
                        </Form.Item>
                        <Form.Item
                            name={"last_name"}
                        >
                            <Input size={"large"}  style={{ width: 550, padding: 12 }} placeholder={"Имя"} />
                        </Form.Item>
                        <Form.Item
                            name={"middle_name"}
                        >
                            <Input size={"large"}  style={{ width: 550, padding: 12 }} placeholder={"Имя"} />
                        </Form.Item>
                        <Form.Item
                            name={"email"}
                        >
                            <Input size={"large"} disabled={true} style={{ width: 550, padding: 12 }} placeholder={"Почта"} />
                        </Form.Item>
                        <Form.Item
                            name={"phone"}
                        >
                            <Input size={"large"}  style={{ width: 550, padding: 12 }} placeholder={"Номер телефона"} />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                style={{
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