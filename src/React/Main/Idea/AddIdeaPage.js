import React, {useLayoutEffect, useState} from "react";
import {Button, Form, Input, Select, Tooltip, Upload} from "antd";
import { Typography } from 'antd';
import {NavLink} from "react-router-dom";
import axios from "axios";
import { HashLink as Link } from 'react-router-hash-link';
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

        if (text.length >= 5) {
            axios.post(ApiRoutes.API_SEARCH, {title: text, content: ""}, {
                withCredentials: true,
                cancelToken: new cancelTokenSource(function executor(c) {
                    cancel = c;
                })
            }).then(response => {
                global.handleResponse(response,
                    function () {
                        if(response.data?.ideas){
                            response.data.ideas.map(idea => {
                                prevSearchItems.push({
                                    id: idea.id,
                                    title: idea.title,
                                    text: idea.content,
                                    status: idea.status,
                                    comments: idea?.commentsCount,
                                    like: Number(idea?.likes),
                                    showFullText: false,
                                    currentUserIsVote: idea.currentUserIsVote,
                                })
                            });
                        }
                    },
                    function () {
                        prevSearchItems = []
                    },
                    () => {},
                    function () {
                        prevSearchItems = null
                    },
                )
                setSearchItems(prevSearchItems);
            })
        } else {
            setSearchItems([])
        }
    };

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
        setLoading(true)
        axios.post(ApiRoutes.API_NEW_IDEA, {
            title: data.title,
            description: data.description,
            category: data.category,
            type: data.type,
            photo: data?.file !== undefined ? data.file.fileList.map(item => item.response.filename).join(";") : ''
        }).then(response => {
            global.handleResponse(response,
                function () {
                    global._history.push(global.lang + '/idea/'+response.data.idea_id + "/")
                },
                function () {
                    global.openNotification("????????????", response.data?.message, "error")
                },
                function () {
                    global._history.push(global.lang + '/idea/'+response.data.idea_id + "/")
                },
            )
            setLoading(false)
        })
    };

    const getCategory = () => {
        let categoryData = [];
        let typesData = [];
        global.categories.map(cat => {
            categoryData.push({id: cat.id, value: cat.name})
        })
        global.types.map(type => {
            typesData.push({id: type.id, value: type.name})
        })
        setCategory(categoryData);
        setTypes(typesData);
    };

    useLayoutEffect(() => {
        getCategory()
    }, []);

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            global.openNotification("????????????????????????????", "???????????????????????????? ???????????? ?????????????????????? ?? ?????????????? JPG / PNG", "warn");
            return false
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            global.openNotification("????????????????????????????","???????????? ?????????????????????? ???? ?????????? ?????????????????? 2 ????!", "warn");
            return false
        }
        return isJpgOrPng && isLt2M;
    };

    function getIdeaItem(idea) {
        return (
            <div className={"i-idea-card"} key={idea.id} style={{ marginBottom: 25 }}>
                <div>
                    <Link to={`${global.lang}/idea/${idea.id}/`} target="_blank">
                        <span style={{ fontSize: 19, fontWeight: 500, color: '#1D1D1D' }}>{idea.title}
                            <Tooltip placement="left" title={idea.status.translate}>
                                <p className={"f-cards-type-viewed f-active-tooltip-add"} style={{
                                    marginTop: 'unset',
                                    marginBottom: 'unset',
                                    color: idea.status?.color ? idea.status?.color : "#000000",
                                    backgroundColor: idea.status?.color ? idea.status?.color + "30" : "#AAB2BD",
                                }}
                                >{idea.status.translate}</p>
                            </Tooltip>
                        </span>
                        <div style={{ color: '#1D1D1D', marginTop: 10 }}>
                            {
                                idea.text.split(" ").length <= 25 ?
                                    <span>{idea.text.split("\n").map(item => {
                                        if (item) {
                                            return (
                                                <p style={{marginBottom: 2}}>{item}</p>
                                            )
                                        }
                                    })}</span> :
                                    idea.text.split(" ").length > 25 && !idea.showFullText ?
                                        <span>{idea.text.split(" ").filter((item, index) => index < 25).join(" ").split("\n").map(item => {
                                            if (item) {
                                                return (
                                                    <p style={{marginBottom: 2}}>{item}</p>
                                                )
                                            }
                                        })}...</span> :
                                        <span>{idea.text.split("\n").map(item => {
                                            if (item) {
                                                return (
                                                    <p style={{marginBottom: 2}}>{item}</p>
                                                )
                                            }
                                        })}</span>
                            }
                        </div>
                    </Link>
                    <div className={"i-idea-bottom"}>
                        <a style={{ color: '#AAB2BD', fontSize: 17 }}>
                            { global.numWord(idea.comments, ["??????????????????????", "??????????????????????", "????????????????????????"]) }
                        </a>
                        <button type={"button"} style={{border: 'none', cursor: 'pointer', marginLeft: 20}}
                                className={"f-cards-under-block-like"}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Icon component={Like} style={{ fontSize: 23 }} />
                                <span className={"f-cards-under-block-like-text"}>{idea.like}</span>
                            </div>
                        </button>
                    </div>
                </div>
                <div style={{width: '100%', height: 1, backgroundColor: '#E6E9ED', marginTop: 25}}/>
            </div>
        )
    }

    return (
        <>
            <div className={"f-login f-sublogin"} style={{ paddingBottom: 95, paddingTop: 95 }}>
                <Form
                    name={"addIdea"}
                    onFinish={(values) => onSend(values)}
                    className={"f-add-idea-page"}
                >
                    <Title style={{marginBottom: 48}}>???????? ?????????</Title>
                    <Form.Item
                        name={"title"}
                        rules={[
                            {
                                required: true,
                                message: '?????????????????? ???????????? ?????????????????? ???? 5 ???? 255 ????????????????',
                                min: 5,
                                max: 255,
                                validator(rule, value, callback) {
                                    if (value.trim().length < 5) {
                                        callback("?????????????????? ???????????? ?????????????????? ???? 5 ???? 255 ????????????????")
                                        return false;
                                    }
                                    callback()
                                }
                            },
                        ]}
                    >
                        <Input onChange={(e) => onSearch(e.currentTarget.value)} size={"large"} style={{fontSize: 17, width: '100%',}} placeholder={"??????????????????"} />
                    </Form.Item>
                    <Form.Item
                        name={"category"}
                        rules={[
                            {
                                required: true,
                                message: '???????????????? ??????????????????',
                            },
                        ]}
                    >
                        <Select size={"large"} style={{fontSize: 17, width: '100%'}} placeholder={"???????????????? ??????????????????"}>
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
                                message: '???????????????? ??????',
                            },
                        ]}
                    >
                        <Select size={"large"} style={{fontSize: 17, width: '100%'}} placeholder={"???????????????? ??????"}>
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
                                message: '???????????????? ???? ?????????? ???????? ???????????? 10 ????????????????',
                                min: 10,
                                validator(rule, value, callback) {
                                    if (value.trim().length < 10) {
                                        callback("???????????????? ???? ?????????? ???????? ???????????? 10 ????????????????")
                                        return false;
                                    }

                                    callback()
                                }
                            },
                        ]}
                    >
                        <TextArea style={{fontSize: 17}} rows={4} placeholder={"????????????????"} autoSize={{ minRows: 4 }}/>
                    </Form.Item>
                    { searchItems?.length > 0 &&
                        <div>
                            <Title style={{ color: '#1D1D1D', fontSize: 32 }}>?????????????? ????????</Title>
                            <div className={"i-idea-wrap"}>
                            {
                                showAllItems ?
                                searchItems.map((idea) => (
                                    getIdeaItem(idea)
                                ))
                                : searchItems.filter((item, index) => index < 2).map((idea) => (
                                    getIdeaItem(idea)
                                ))
                            }
                            </div>
                            {
                                searchItems?.length > 2 &&
                                <div onClick={() => setShowAllItems(!showAllItems)} style={{ color: '#3D72ED', marginBottom: 15, cursor: 'pointer' }}>
                                    { showAllItems ? "????????????  " : "??????  "}
                                    { showAllItems ? <UpOutlined/> : <DownOutlined/>}
                                </div>
                            }
                        </div>
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
                            <Button icon={<UploadOutlined/>}>?????????????????? ??????????????????????</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <div style={{
                            display: "flex",
                            flexWrap: "nowrap"
                        }}>
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
                                shape="round">??????????????????</Button>
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
                                }} onClick={() => {
                                    global._history.goBack()
                                }}
                                shape="round">??????????????</Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
};

export default AddIdeaPage;