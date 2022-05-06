import React, {useEffect, useState} from "react";
import {Button, Checkbox, Form, Input, Modal, Select, Upload} from "antd";
import { Typography } from 'antd';
import {NavLink} from "react-router-dom";
import axios from "axios";
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AddIdeaPage = () => {

    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [types, setTypes] = useState([]);

    const [fileList, setFileList] = useState([
    ]);

    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onPreview = async file => {
        let src = file.url;
        if (!src) {
            src = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow.document.write(image.outerHTML);
    };

    const onSend = (data) => {
        axios.post("http://127.0.0.1:8000/ideas/api/new/", {
            title: data.title,
            description: data.description,
            category: data.category,
            type: data.type,
            photo: data.file.fileList.map(item => item.response.filename).join(";")
        }).then(response => {
            console.log(response.data)
        })
    };

    const getCategory = () => {
        setLoading(true);
        axios.get("http://127.0.0.1:8000/ideas/api/getCategories/").then(response => {
            let categoryData = [];
            let typesData = [];
            if (response.data?.categories){
                response.data.categories.map(cat => {
                    categoryData.push({id: cat.id, value: cat.name})
                })
            }

            if (response.data?.types){
                response.data.types.map(type => {
                    typesData.push({id: type.id, value: type.name})
                })
            }
            setCategory(categoryData);
            setTypes(typesData);
            setLoading(false)
        })
    };

    useEffect(() => {
        getCategory()
    }, []);

    return (
        <>
            <div className={"f-login"}>
                <Form
                    onFinish={(values) => onSend(values)}
                >
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
                        <Input size={"large"} style={{ fontSize: 17, width: '440px' }} placeholder={"Заголовок"} minLength={5} maxLength={255}/>
                    </Form.Item>
                    <Form.Item
                        name={"category"}
                        rules={[
                            {
                                required: true,
                                message: 'Выберите категорию',
                            },
                        ]}
                    >
                        <Select size={"large"} style={{ fontSize: 17, width: '440px', }} placeholder={"Выберите категорию"}>
                            {
                                category.map(categories => {
                                    return <Option value={categories.id}>{categories.value}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name={"type"}
                        rules={[
                            {
                                required: true,
                                message: 'Выберите тип',
                            },
                        ]}
                    >
                        <Select size={"large"} style={{ fontSize: 17, width: '440px' }} placeholder={"Выберите тип"}>
                            {
                                types.map(types => {
                                    return <Option value={types.id}>{types.value}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name={"description"}
                        rules={[
                            {
                                required: true,
                                message: 'Напишите описание',
                            },
                        ]}
                    >
                        <TextArea style={{ fontSize: 17 }} rows={4} placeholder={"Описание"} />
                    </Form.Item>
                    <Form.Item
                        name={"file"}
                    >
                        <Upload
                            action="http://127.0.0.1:8000/api/user/upload/"
                            listType="picture-card"
                            fileList={fileList}
                            onChange={onChange}
                            onPreview={onPreview}
                        >
                            {fileList.length < 5 && '+ Upload'}
                        </Upload>
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