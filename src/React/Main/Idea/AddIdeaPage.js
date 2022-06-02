import React, {useEffect, useMemo, useRef, useState} from "react";
import {Button, Checkbox, Form, Input, Modal, Select, Spin, Upload} from "antd";
import { Typography } from 'antd';
import {NavLink} from "react-router-dom";
import axios from "axios";
import UploadOutlined from "@ant-design/icons/lib/icons/UploadOutlined";
const { Title } = Typography;
const { Option } = Select;
import debounce from 'lodash/debounce';
import ApiRoutes from "../../Routes/ApiRoutes";
const { TextArea } = Input;

const DebounceSelect = ({ fetchOptions, debounceTimeout = 800, ...props }) => {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);
    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    return;
                }

                setOptions(newOptions);
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);
    return (
        <Select
            labelInValue
            autoClearSearchValue={false}
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching && null}
            {...props}
            options={options}
        />
    );
};

const fetchUserList = async (text) => {
    return await fetch(ApiRoutes.API_SEARCH,
    {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-cache',
            body: JSON.stringify({title: text, content: ""})
        }).then(response => response.json())
        .then((body) =>
            body.ideas.map((item) => ({
                label: <div onClick={() => global._history.replace("/idea/" + item.id)}>{item.title}</div>,
            }))
        )
};

const AddIdeaPage = () => {
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [types, setTypes] = useState([]);
    const [value, setValue] = useState([]);

    const [fileList, setFileList] = useState([]);

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
        // console.log(data.file);
        axios.post(ApiRoutes.API_NEW_IDEA, {
            title: data.title.map(item => item.value).join(" "),
            description: data.description,
            category: data.category,
            type: data.type,
            photo: data?.file !== undefined ? data.file.fileList.map(item => item.response.filename).join(";") : ''
        }).then(response => {
            console.log(response)
            if (response.data.state === "success"){
                global._history.replace('/')
            }
        })
    };

    const getCategory = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
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
                        {/*<Input value={value} hidden={true} size={"large"} style={{ fontSize: 17, width: '440px' }} placeholder={"Заголовок"} minLength={5} maxLength={255}/>*/}
                        <DebounceSelect
                            mode="tags"
                            value={value}
                            autoClearSearchValue={false}
                            size={"large"}
                            minLength={5}
                            maxLength={255}
                            placeholder="Заголовок"
                            style={{ fontSize: 17, width: '440px' }}
                            fetchOptions={fetchUserList}
                            onChange={(newValue) => {
                                setValue(newValue);
                            }}
                        />
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
                                message: 'Описание не может быть меньше 10 символов',
                                min: 10
                            },
                        ]}
                    >
                        <TextArea style={{ fontSize: 17 }} rows={4} placeholder={"Описание"} />
                    </Form.Item>
                    <Form.Item
                        name={"file"}
                    >
                        <Upload
                            action={ApiRoutes.API_UPLOAD_IMAGE}
                            fileList={fileList}
                            onChange={onChange}
                            onPreview={onPreview}
                            listType="picture"
                            defaultFileList={[...fileList]}
                        >
                            <Button icon={<UploadOutlined />}>Upload</Button>
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