import React, { useLayoutEffect, useState } from "react";
import {Button, Form, Input, Select, Tooltip, Upload} from "antd";
import { Typography } from 'antd';
import {Link, NavLink} from "react-router-dom";
import axios from "axios";
import UploadOutlined from "@ant-design/icons/lib/icons/UploadOutlined";
const {Option} = Select;
import ApiRoutes from "../../Routes/ApiRoutes";
import Icon from "@ant-design/icons/es";
import Like from "../../../../public/i/like.svg";
import {DownOutlined, UpOutlined} from "@ant-design/icons";
const { TextArea } = Input;
const { Title } = Typography;
const cancelTokenSource = axios.CancelToken;
let cancel;

const AddIdeaPage = () => {
    const [category, setCategory] = useState([]);
    const [types, setTypes] = useState([]);

    const [fileList, setFileList] = useState([]);
    const [searchItems, setSearchItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);

    const onSearch = (text) => {
        if (cancel !== undefined) {
            cancel();
        }
        let prevSearchItems = [];

        axios.post(ApiRoutes.API_SEARCH, {title: text, content: ""}, {withCredentials: true, cancelToken: new cancelTokenSource(function executor(c) {cancel = c;}) }).then(response => {
            if (response.data?.ideas && response.data.state === "success") {
                response.data?.ideas.map(idea => {
                    prevSearchItems.push({
                        id: idea.id,
                        title: idea.title,
                        comments: idea.comments,
                        text: idea.content,
                        like: Number(idea.likes),
                        showFullText: false,
                        currentUserIsVote: idea.currentUserIsVote,
                    })
                });
            } else if (response.data.state === "error") {
                prevSearchItems = []
            } else {
                prevSearchItems = null
            }
            setSearchItems(prevSearchItems);
        })
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
                    global._history.push(global.lang + '/idea/'+response.data.idea_id + "/")
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

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            global.openNotification("Предупреждение", "Поддерживает только изображения» в формате JPG / PNG", "warn");
            return false
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            global.openNotification("Предупреждение","Размер изображения не может превышать 2 МБ!", "warn");
            return false
        }
        return isJpgOrPng && isLt2M;
    };

    return (
        <>
            <div className={"f-login"}>
                <Form
                    name={"addIdea"}
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
                        <Input onChange={(e) => onSearch(e.currentTarget.value)} size={"large"} style={{fontSize: 17, width: '480px',}} placeholder={"Заголовок"} />
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
                        <Select size={"large"} style={{fontSize: 17, width: '480px',}}
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
                        <Select size={"large"} style={{fontSize: 17, width: '480px'}} placeholder={"Выберите тип"}>
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
                        <TextArea style={{fontSize: 17}} rows={4} placeholder={"Описание"} autoSize={{ minRows: 4 }}/>
                    </Form.Item>
                    { searchItems?.length > 0 &&
                        <Form.Item>
                            <Title style={{ color: '#1D1D1D', fontSize: 32 }}>Похожие идеи</Title>
                            <div className={"i-idea-wrap"}>
                                {
                                    showAllItems ?
                                    searchItems.map((item) => (
                                        <div className={"i-idea-card"} key={item.id}>
                                            <Link to={global.lang + "/idea/" + item.id + "/"}>
                                                <span style={{ fontSize: 17, fontWeight: 500, color: '#1D1D1D' }}>{item.title}</span>
                                                <div style={{ color: '#1D1D1D' }}>
                                                    {
                                                        item.text.split(" ").length <= 25 ?
                                                            <span>{item.text}</span> :
                                                            item.text.split(" ").length > 25 && !item.showFullText ?
                                                                <span>{item.text.split(" ").filter((item, index) => index < 25).join(" ")}...</span> :
                                                                <span>{item.text}</span>
                                                    }
                                                </div>
                                            </Link>
                                            <div className={"i-idea-bottom"}>
                                                <a className={"f-cards-under-block-comment"}>
                                                    {global.numWord(52, ["комментарий", "комментария", "комментариев"])}
                                                </a>
                                                <button type={"button"} style={{border: 'none', cursor: 'pointer', marginLeft: 20}}
                                                        className={"f-cards-under-block-like"}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Icon component={Like} style={{ fontSize: 23 }} />
                                                        <span className={"f-cards-under-block-like-text"}>{item.like}</span>
                                                    </div>
                                                </button>
                                            </div>
                                            <div style={{ width: '100%', height: 1, backgroundColor: '#E6E9ED', marginTop: 25 }}></div>
                                        </div>
                                    )) :
                                        searchItems.filter((item, index) => index < 2).map((item) => (
                                            <div className={"i-idea-card"} key={item.id}>
                                                <Link to={global.lang + "/idea/" + item.id + "/"}>
                                                    <span style={{ fontSize: 19, fontWeight: 500, color: '#1D1D1D' }}>{item.title}</span>
                                                    <div style={{ color: '#1D1D1D' }}>
                                                        {
                                                            item.text.split(" ").length <= 25 ?
                                                                <span>{item.text}</span> :
                                                                item.text.split(" ").length > 25 && !item.showFullText ?
                                                                    <span>{item.text.split(" ").filter((item, index) => index < 25).join(" ")}...</span> :
                                                                    <span>{item.text}</span>
                                                        }
                                                    </div>
                                                </Link>
                                                <div className={"i-idea-bottom"}>
                                                    <a style={{ color: '#AAB2BD', fontSize: 17 }}>
                                                        {global.numWord(12, ["комментарий", "комментария", "комментариев"])}
                                                    </a>
                                                    <button type={"button"} style={{border: 'none', cursor: 'pointer', marginLeft: 20}}
                                                            className={"f-cards-under-block-like"}>
                                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                            <Icon component={Like} style={{ fontSize: 23 }} />
                                                            <span className={"f-cards-under-block-like-text"}>{item.like}</span>
                                                        </div>
                                                    </button>
                                                </div>
                                                <div style={{ width: '100%', height: 1, backgroundColor: '#E6E9ED', marginTop: 25 }}></div>
                                            </div>
                                        ))
                                }
                            </div>
                            {
                                searchItems?.length > 2 &&
                                <div onClick={() => setShowAllItems(!showAllItems)} style={{ marginTop: 25, color: '#3D72ED', marginBottom: 15, cursor: 'pointer' }}>
                                    {showAllItems ? "Скрыть  " : "Еще  "}
                                    {showAllItems ? <UpOutlined/> : <DownOutlined/>}
                                </div>
                            }
                        </Form.Item>
                    }
                    <Form.Item
                        name={"file"}
                    >
                        <Upload
                            accept=".jpeg, .png, .jpg"
                            action={ApiRoutes.API_UPLOAD_IMAGE}
                            fileList={fileList}
                            onChange={onChange}
                            onPreview={onPreview}
                            listType="picture"
                            defaultFileList={[...fileList]}
                            beforeUpload={(file) => beforeUpload(file)}
                        >
                            <Button icon={<UploadOutlined/>}>Загрузить изображение</Button>
                        </Upload>
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
                            }}
                            loading={loading}
                            type="primary"
                            htmlType="submit"
                            shape="round">Отправить</Button>
                        <Button
                            style={{
                                    marginLeft: 10,
                                    paddingRight: 27,
                                    paddingLeft: 27,
                                    boxShadow: 'none',
                                    color: '#CCD1D9',
                                    backgroundColor: 'white',
                                    border: "none",
                                    fontSize: 20,
                                    height: 60,
                            }}
                            shape="round"><NavLink to={""}>Закрыть</NavLink></Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default AddIdeaPage;