import React, { useLayoutEffect, useState } from "react";
import { Button, Form, Input, Select, Upload } from "antd";
import { Typography } from 'antd';
import { NavLink } from "react-router-dom";
import axios from "axios";
import UploadOutlined from "@ant-design/icons/lib/icons/UploadOutlined";

const {Option} = Select;
import ApiRoutes from "../../Routes/ApiRoutes";
import AsyncSelect from 'react-select/async';
const { TextArea } = Input;
const { Title } = Typography;

const AddIdeaPage = () => {
    const [category, setCategory] = useState([]);
    const [types, setTypes] = useState([]);
    const [value, setValue] = useState([]);

    const [fileList, setFileList] = useState([]);

    const [selectedValue, setSelectedValue] = useState(null);

    const handleInputChange = (value, { action }) => {
        console.log(action, value)
        if (action === "input-change"){
            setSelectedValue(value)
        }
    };

    const loadOptions = (inputValue) => {
        return fetch(ApiRoutes.API_SEARCH,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
                body: JSON.stringify({title: inputValue, content: ""})
            }
        ).then((res) => res.json())
            .then(data => data.ideas);
    };

    const onChange = ({fileList: newFileList}) => {
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
        axios.post(ApiRoutes.API_NEW_IDEA, {
            title: data.title.map(item => item.value).join(" "),
            description: data.description,
            category: data.category,
            type: data.type,
            photo: data?.file !== undefined ? data.file.fileList.map(item => item.response.filename).join(";") : ''
        }).then(response => {
            console.log(response)
            switch (response.data.state) {
                case "trouble":
                case "success":
                    global._history.replace('/idea/'+response.data.idea_id)
                    break;
                case "error":
                    global.openNotification("Ошибка", response.data?.message, "error")
                    break;
                default:
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                    break;
            }
        })
    };

    const getCategory = () => {
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            let categoryData = [];
            let typesData = [];
            if (response.data?.categories) {
                response.data.categories.map(cat => {
                    categoryData.push({id: cat.id, value: cat.name})
                })
            }

            if (response.data?.types) {
                response.data.types.map(type => {
                    typesData.push({id: type.id, value: type.name})
                })
            }
            setCategory(categoryData);
            setTypes(typesData);
        })
    };

    useLayoutEffect(() => {
        getCategory()
    }, []);

    const colourStyles = {
        placeholder: styles => ({ ...styles, color: '#c7c7c7'}),
        control: styles => ({ ...styles, backgroundColor: 'white', width: 440, height: 40, borderRadius: 8, fontSize: 17,}),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                color: 'black',
                cursor: isDisabled ? 'not-allowed' : 'default',
            };
        },
    };

    return (
        <>
            <div className={"f-login"}>
                <Form
                    onFinish={(values) => console.log(values)}
                >
                    <Title style={{marginBottom: 48}}>Есть идея?</Title>
                    <Form.Item
                        name={"title"}
                        rules={[
                            {
                                required: true,
                                message: 'Заголовок не может быть меньше 5 символов',
                                min: 5
                            },
                        ]}
                    >
                        <AsyncSelect
                            setFieldsValue={selectedValue}
                            value={selectedValue}
                            defaultInputValue={selectedValue}
                            inputValue={selectedValue}
                            placeholder={"Заголовок"}
                            styles={colourStyles}
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: () => null,
                            }}
                            loadingMessage={() => null}
                            noOptionsMessage={() => null}
                            getOptionLabel={e =>
                                <div onClick={() => global._history.replace("/idea/" + e.id)}>{e.title}</div>
                            }
                            getOptionValue={e => e.id}
                            loadOptions={loadOptions}
                            onInputChange={handleInputChange}
                            onChange={handleInputChange}
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
                        <Select size={"large"} style={{fontSize: 17, width: '440px',}}
                                placeholder={"Выберите категорию"}>
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
                        <Select size={"large"} style={{fontSize: 17, width: '440px'}} placeholder={"Выберите тип"}>
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
                        <TextArea style={{fontSize: 17}} rows={4} placeholder={"Описание"} autoSize={true}/>
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
                            <Button icon={<UploadOutlined/>}>Загрузить изображение</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button className={"f-login-btn"} type="primary" htmlType="submit"
                                shape="round">Отправить</Button>
                        <Button style={{marginLeft: 10, boxShadow: 'none'}} className={"f-login-btn"}
                                shape="round"><NavLink to={""}>Закрыть</NavLink></Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default AddIdeaPage;