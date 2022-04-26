import React from "react";
import {Button, Checkbox, Form, Input, Select} from "antd";
import { Typography } from 'antd';
import {NavLink} from "react-router-dom";
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddIdeaPage = () => {
    return (
        <>
            <div className={"f-login"}>
                <Form>
                    <Title style={{ marginBottom: 48 }}>Есть идея?</Title>
                    <Form.Item
                        name={"title"}
                        rules={[
                            {
                                required: true,
                                message: 'Придумайте заголовок',
                            },
                        ]}
                    >
                        <Input style={{ fontSize: 17, width: '440px' }} placeholder={"Заголовок"}/>
                    </Form.Item>
                    <Form.Item
                        name={"category"}
                    >
                        <Select style={{ fontSize: 17, width: '440px', }} placeholder={"Выберите категорию"}>
                            <Option value="jack">Jack</Option>
                            <Option value="lucy">Lucy</Option>
                            <Option value="disabled" disabled>
                                Disabled
                            </Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name={"type"}
                    >
                        <Select style={{ fontSize: 17, width: '440px' }} placeholder={"Выберите тип"}>
                            <Option value="jack">Jack</Option>
                            <Option value="lucy">Lucy</Option>
                            <Option value="disabled" disabled>
                                Disabled
                            </Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <TextArea style={{ fontSize: 17 }} rows={4} placeholder={"Описание"} />
                    </Form.Item>
                    <Form.Item>
                        <Button className={"f-login-btn"} type="primary" htmlType="submit" shape="round">Отправить</Button>
                        <Button style={{ marginLeft: 10, boxShadow: 'none' }} className={"f-login-btn"} shape="round"><NavLink to={""}>Закрыть</NavLink></Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default AddIdeaPage;