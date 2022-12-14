import React, {useEffect, useLayoutEffect, useState} from "react";
import Header from "../Components/Header";
import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js'
import {Col, Typography, Image, Form, Input, Button, Avatar, Upload, Spin, Tooltip, Select, Modal, Result} from "antd";
import Camera from "../../../../public/i/camera.svg"
import ApiRoutes from "../../Routes/ApiRoutes";
import Icon, {UserOutlined, LoadingOutlined} from '@ant-design/icons'
import axios from "axios";
import InputTopTitle from "../Components/Custom/InputTopTitle";
const {Option} = Select;

const { Title } = Typography;

const Settings = () => {

    const [sendLoading, setSendLoading] = useState(false);
    const [file, setFile] = useState("");
    const [user, setUser] = useState(global.user?.phone ? {...global.user, phone: parsePhoneNumber(global.user.phone.trim(),"RU")?.formatInternational()} : global.user);
    const [phone, setPhone] = useState(global.user?.phone ? parsePhoneNumber(global.user.phone.trim(),"RU") : "");
    const [phoneText, setPhoneText] = useState("+7")
    const [validatePhone, setValidatePhone] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [registerKey, setRegisterKey] = useState("");

    useLayoutEffect(() => {
        if (phone) {
            try {
                setPhoneText(phone.formatInternational());
            } catch (e) {
            }
        }
    })

    const onSend = (value) => {
        if (!validatePhone) {
            return
        }
        setSendLoading(true);
        if (file) {
            value.image = file
        }
        value.phone = phone ? phone?.countryCallingCode + phone?.nationalNumber : null
        // return console.log(value)

        axios.post(ApiRoutes.API_SET_PROFILE, value).then(response => {
            global.handleResponse(response,
                function () {
                    global.user = response.data?.profile;
                    setUser(response.data?.profile);
                    global.openNotification("??????????????", "???????????? ??????????????????", "success")
                },
                function () {
                    global.openNotification("????????????", "???????????? ???? ??????????????????", "success")
                },
            )
            setFile(value.image)
            setSendLoading(false)
        })
    };

    const uploadProps = {
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

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubscribe = (value) => {
        if (value === "disable"){
            axios.post(ApiRoutes.API_UNSUBSCRIBE_USER, {type: "unsubscribe"}).then(response => {
                if (response.data.state === "success") {
                    global.user.unsubscribed = 'disable';
                    global.openNotification("??????????????", "???? ???????????????????? ???? ????????????????", "success")
                } else {
                    global.openNotification("????????????", "???????????? ?????????????? ???? ????????????????", "error")
                }
            })
        } else if (value === "enable") {
            axios.post(ApiRoutes.API_UNSUBSCRIBE_USER, {type: "subscribe"}).then(response => {
                if (response.data.state === "success") {
                    global.user.unsubscribed = 'enable';
                    global.openNotification("??????????????", "???? ?????????????????????? ???? ????????????????", "success")
                } else {
                    global.openNotification("????????????", "???????????? ???????????????? ???? ????????????????", "error")
                }
            })
        }
    };

    const releaseTelegramKey = () => {
        axios.post(ApiRoutes.API_RELEASE_TELEGRAM_KEY).then(response => {
            if (response.data.state === "success") {
                setRegisterKey(response.data.key);
                setIsModalOpen(true);
            } else {
                global.openNotification("????????????", response.data.message, "error")
            }
        })
    };

    return (
        <Col style={{minHeight: '100vh', display: 'flex', justifyContent: 'flex-start'}}>
            { user?.id === global.user?.id && <Header/>}
            <div className={"f-login f-sublogin"} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={"f-wrap-settings"}>
                    <div className={"HELLO"}>
                        <Modal
                            centered
                            closable={true}
                            destroyOnClose={true}
                            style={{ zIndex: 999 }}
                            visible={isModalOpen}
                            onCancel={handleCancel}
                            footer={null}
                        >
                            <Result
                                status="success"
                                title="?????????????????????????????? ???????? ??????????????"
                                subTitle={<p>???????????????????? ?????? ???????? <b style={{ fontSize: 15 }}>{registerKey}</b> ?? ?????????????????? ?? <a target="_blank" rel="noopener noreferrer" href='https://t.me/atmagurubot?start=1'>????????</a> ?????? ??????????????????????</p>}
                            />
                        </Modal>
                    </div>
                    <Form
                        onFinish={(value) => onSend(value)}
                        name={"settings"}
                        initialValues={user}
                    >
                        <Form.Item
                            name={"image"}
                        >
                            <Title>??????????????????</Title>
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
                                <Upload {...uploadProps}>
                                    <button type={"button"} className={"t-upload-button"}>
                                        <Icon component={Camera} style={{ fontSize: 23 }} />
                                    </button>
                                </Upload>
                            </div>
                        </Form.Item>
                        <Form.Item
                            id={1}
                            name={"first_name"}
                            rules={[
                                {
                                    required: true,
                                    message: '????????????????????, ?????????????? ??????',
                                },
                            ]}
                        >
                            <Input autoComplete="off" size={"large"} style={{ width: '100%', padding: 12, marginTop: 15 }} placeholder={"??????"} />
                        </Form.Item>
                        <Form.Item
                            id={2}
                            name={"middle_name"}
                        >
                            <Input autoComplete="off" size={"large"}  style={{ width: '100%', padding: 12 }} placeholder={"??????????????"} />
                        </Form.Item>
                        <Form.Item
                            id={3}
                            name={"last_name"}
                        >
                            <Input autoComplete="off" size={"large"}  style={{ width: '100%', padding: 12 }} placeholder={"????????????????"} />
                        </Form.Item>
                        <Form.Item
                            id={4}
                            name={"email"}
                        >
                            <Tooltip placement="topLeft" color={"black"} title="???????????????????????????? ?????????? ??????????????????">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'not-allowed',
                                }}>
                                    <Input autoComplete="off" size={"large"} disabled={true} style={{ width: '100%', padding: 12 }} placeholder={user.email} />
                                </div>
                            </Tooltip>
                        </Form.Item>
                        <Form.Item
                            id={5}
                            name={"phone"}
                            validateStatus={validatePhone ? "success" : "error"}
                            help={"?? ?????????????????????????? ??????????????, ????????????????: +79XX XXX XX XX"}
                        >
                            <InputTopTitle
                                setPhone={setPhone}
                                updateInput={setPhoneText}
                                setValidate={setValidatePhone}
                                inputProps={{
                                    value: phoneText,
                                    placeholder: '??????????????',
                                    name: "phone",
                                    size: "large",
                                    style: {
                                        width: '100%',
                                        padding: 12
                                    },
                                }}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Select defaultValue={global.user.unsubscribed} style={{ marginTop: 24 }} onChange={(value) => handleSubscribe(value)}>
                                <Option value="disable">???? ?????????????????? ?????????????????????? ???? ??????????</Option>
                                <Option value="enable">?????????????????? ?????????????????????? ???? ??????????</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <a onClick={() => releaseTelegramKey()} style={{ fontSize: 16, marginLeft: 0 }}>???????????????? ?????????????????????? ?????????? ????????????????</a>
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
                                ??????????????????
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Col>
    )
};

export default Settings;