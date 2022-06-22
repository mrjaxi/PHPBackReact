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

    const [loading, setLoading] = useState(false);

    const handleInputChange = (value, { action }) => {
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
        setLoading(true)
        axios.post(ApiRoutes.API_NEW_IDEA, {
            title: data.title,
            description: data.description,
            category: data.category,
            type: data.type,
            photo: data?.file !== undefined ? data.file.fileList.map(item => item.response.filename).join(";") : ''
        }).then(response => {
            switch (response.data.state) {
                case "trouble":
                case "success":
                    global._history.push(global.lang + '/idea/'+response.data.idea_id)
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
        placeholder: styles => ({ ...styles, color: '#c1c1c1'}),
        control: styles => ({ ...styles, height: 40, width: 440, borderColor: '#d9d9d9', fontSize: 17, borderRadius: 8}),
        // control: styles => ({ ...styles, backgroundColor: 'white', width: 440, height: 20, borderRadius: 8, fontSize: 17,}),
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
                    onFinish={(values) => onSend(values)}
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
                        <div className="ant-form-item-control-input">
                            <div className="ant-form-item-control-input-content">
                                <AsyncSelect
                                    id={"header"}
                                    setFieldsValue={selectedValue}
                                    value={selectedValue}
                                    defaultInputValue={selectedValue}
                                    inputValue={selectedValue}
                                    placeholder={"Заголовок"}
                                    styles={colourStyles}
                                    className={"f-react-select"}
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: () => null,
                                    }}
                                    loadingMessage={() => null}
                                    noOptionsMessage={() => null}
                                    getOptionLabel={e =>
                                        <div onClick={() => global._history.push(global.lang + "/idea/" + e.id)}>{e.title}</div>
                                    }
                                    getOptionValue={e => e.id}
                                    loadOptions={loadOptions}
                                    onInputChange={handleInputChange}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
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
                        <Button
                            className={"f-write-comments-button"}
                            style={{ paddingRight: 20, paddingLeft: 20, boxShadow: '0px 16px 32px 4px rgba(61, 114, 237, 0.24)' }}
                            loading={loading} type="primary" htmlType="submit"
                                shape="round">Отправить</Button>
                        <Button
                            className={"f-write-comments-button"}
                            style={{marginLeft: 10, paddingRight: 20, paddingLeft: 20, boxShadow: 'none', color: '#CCD1D9'}}
                            shape="round"><NavLink to={""}>Закрыть</NavLink></Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default AddIdeaPage;