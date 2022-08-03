import React, {useEffect, useLayoutEffect, useState} from "react";
import {Avatar, Button, Checkbox, Form, Image, Input, Popconfirm, Skeleton, Spin, Typography, Upload} from "antd";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import {
    CameraOutlined,
    LoadingOutlined,
    UserOutlined
} from "@ant-design/icons";
import Login from "../Auth/Login";
import {Link} from "react-router-dom";
import UploadOutlined from "@ant-design/icons/lib/icons/UploadOutlined";

const {Title} = Typography;
const {TextArea} = Input;

const Comments = ({comments, setComments, href, idea, setIdea, allowComments, flag, setStatus=()=>{} }) => {

    const [form] = Form.useForm();
    const [showComments, setShowComments] = useState(true);
    const [commentsData, setCommentsData] = useState(comments.filter((item, index) => index > (comments.length - 4)));
    const [rawCommentsData, setRawCommentsData] = useState(comments);
    const [visible, setVisible] = useState(false);
    const [editableId, setEditableId] = useState(false);
    const [checked, setChecked] = useState(false);
    const [fileList, setFileList] = useState([]);

    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const beforeUpload = (file) => {
        if (fileList.length < 3) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                global.openNotification("Предупреждение", "Поддерживаются только изображения в формате JPG / PNG", "warn");
                return false
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                global.openNotification("Предупреждение","Размер изображения не может превышать 2 МБ!", "warn");
                return false
            }
            return isJpgOrPng && isLt2M;
        } else {
            global.openNotification("Предупреждение","Количество изображений должено быть не больше 3", "warn");
            return false
        }
    };

    const onChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const sendComment = (text) => {
        setLoading(true);
        if (text.comment.trim() !== "") {
            if (checked) {
                axios.post(ApiRoutes.API_NEW_OFFICIAL_COMMENT, {
                    idea_id: idea?.idea_id,
                    content: text.comment,
                    photo: text?.photo !== undefined ? text.photo.fileList.map(item => item.response.filename).join(";") : ''
                }).then(response => {
                    global.handleResponse(response,
                        function () {
                            form.resetFields()
                            let data = [...rawCommentsData];
                            data.push({...response.data?.comment, dateString: global.getDateString(new Date())});
                            setCommentsData(data);
                            setRawCommentsData(data);
                            setShowComments(false)


                            let newIdea = {...idea}
                            newIdea.officialComment = response.data.comment
                            newIdea.allowComments = false
                            newIdea.comments = data
                            newIdea.showComments = false
                            newIdea.status = response.data?.status
                            setIdea(newIdea)
                            setStatus(response.data?.status)
                            setFileList([])
                        },
                        function () {
                            global.openNotification("Ошибка", response.data?.message, "error")
                        },
                    );
                    setLoading(false)
                })
            } else {
                axios.post(ApiRoutes.API_NEW_COMMENT, {
                    idea_id: idea?.idea_id,
                    content: text.comment.trim(),
                    photo: text?.photo !== undefined ? text.photo.fileList.map(item => item.response.filename).join(";") : ''
                })
                    .then(response => {
                        global.handleResponse(response,
                            function () {
                                form.resetFields()
                                let data = [...rawCommentsData];
                                data.push({...response.data?.comment, dateString: global.getDateString(new Date())});
                                setCommentsData(showComments ? data.filter((item, index) => index > (data.length - 4)) : data);
                                setRawCommentsData(data);
                                setComments(data)
                                setFileList([])
                            },
                            function () {
                                global.openNotification("Ошибка", response.data?.message, "error")
                            },
                        );
                        setLoading(false);
                    }
                )
            }
        }
    };

    const editComment = (index, commentID, newValue) => {
        setLoadingEdit(true)
        if (newValue.trim() !== ""){
            axios.post(ApiRoutes.API_CHANGE_COMMENT, {comment_id: commentID, content: newValue}).then(response => {
                global.handleResponse(response,
                    function () {
                        let newIdea = {...idea}
                        let newComments = [...rawCommentsData];

                        let commentData = newComments.map(item => {
                            if (item.id === Number(commentID)){
                                item.content = newValue
                                item.updated = true
                            }
                            return item;
                        });

                        if(newIdea?.officialComment?.id === commentData[index]?.id) {
                            newIdea.officialComment = commentData[index]
                        }
                        newIdea.comments = commentData
                        setIdea(newIdea)
                        setCommentsData(showComments ? commentData.filter((item, index) => index > (commentData.length - 4)) : commentData);
                        setRawCommentsData(commentData);
                        setEditableId(false);
                        global.openNotification("Успешно", "Комментарий отредактирован", "success")
                    },
                    function () {
                        global.openNotification("Ошибка", response.data?.message, "error")
                    },
                )
                setLoadingEdit(false);
            })
        }
    };

    const onDeleteComment = (id) => {
        axios.post(ApiRoutes.API_DELETE_COMMENT, {comment_id: id}).then(response => {
            global.handleResponse(response,
                function () {
                    if(idea.officialComment?.id === id){
                        let newIdea = {...idea};
                        newIdea.officialComment = null;
                        let dataComments = rawCommentsData.filter(item => item.id !== id);
                        newIdea.comments = dataComments
                        setCommentsData(showComments ? dataComments.filter((item, index) => index > (dataComments.length - 4)) : dataComments);
                        setRawCommentsData(dataComments);
                        setIdea(newIdea);
                    } else {
                        let dataComments = rawCommentsData.filter(item => item.id !== id);
                        setCommentsData(showComments ? dataComments.filter((item, index) => index > (dataComments.length - 4)) : dataComments);
                        setRawCommentsData(dataComments);
                        setComments(dataComments);
                    }
                    global.openNotification("Успешно", "Комментарий удален", "success")
                },
                function () {
                    global.openNotification("Ошибка", response.data?.message, "error")
                }
            )
        })
    };

    return (
        <div className={"f-comments"}>
            <Login visible={visible} setVisible={setVisible}/>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {
                    (["ROLE_ADMIN", "ROLE_DEV"].some(el => global.user?.roles?.includes(el)) && href) &&
                    <span className={"f-system-from"}>Отправлено из: <a style={{ fontSize: 17}} href={href}>{href}</a></span>
                }
                <span className={"f-comments-tip-text"}>Комментарии</span>
            </div>
            {
                rawCommentsData.length > 3 &&
                <div className={"f-comments-under-text"}>
                    <a
                        className={"f-comments-text-button"}
                        onClick={() => {
                            if (showComments) {
                                setCommentsData(rawCommentsData), setShowComments(false)
                            }
                            if (!showComments) {
                                setCommentsData(rawCommentsData.filter((item, index) => index > (comments.length - 4))), setShowComments(true)
                            }
                        }}>{(showComments) ? "Показать предыдущие комментарии" : "Скрыть"}</a>
                </div>
            }
            <div className={"f-comments-scroll"}>
                {
                    flag ? <></> :
                    commentsData.length === 0 ? (
                            <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{marginTop: 20, paddingRight: 50}}>
                                <span className={"f-cards-content-description"}>{
                                    allowComments ? "Вы можете оставить первый комментарий" : "Комментариев нет"
                                }</span>
                            </div>
                        ) :
                            commentsData.map((comment, index) => (
                                <>
                                    <div
                                        key={index}
                                        className={"f-cards-avatar f-cards-avatar-bottom-border f-addon-style"}
                                        style={{
                                            backgroundColor: (!comment?.is_checked && idea?.user.id === global.user.id) ? "#42C82C50" : "#ffffff00"
                                        }}
                                    >
                                        <div className={"f-cards-row-wrap"}>
                                            <Link to={global.lang + `/profile/${comment.user.id}/`}>
                                                <Avatar size={48} style={{minWidth: 48, minHeight: 48,backgroundColor: '#AAB2BD'}}
                                                    src={comment.user.image
                                                        ? <img src={comment.user.image}/>
                                                        : <UserOutlined/>
                                                    }/>
                                            </Link>
                                            <div className={"f-cards-wrap-text"}>
                                                <span
                                                    className={"f-cards-text"}
                                                    style={{justifyContent: "flex-start"}}
                                                >
                                                    <Link to={global.lang + `/profile/${comment.user.id}/`}>
                                                        <span style={{color: "black"}}>
                                                            <p className={"f-fio-text"}>
                                                                {(comment.user?.first_name + " " + (comment.user?.last_name ? comment.user?.last_name : "")).trim()}
                                                                {
                                                                    ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => comment?.user.roles?.includes(el)) &&
                                                                    <img style={{marginBottom: 3, marginLeft: 5}}
                                                                         src={"/i/official.svg"}
                                                                         width={15} height={15}/>
                                                                }
                                                            </p>
                                                        </span>
                                                    </Link>
                                                    {
                                                        comment.updated &&
                                                        <span style={{ color: '#AAB2BD', fontSize: 15, marginLeft: 10, fontWeight: 400 }}>ред.</span>
                                                    }
                                                </span>
                                                {
                                                    editableId === comment.id ?
                                                    <Form
                                                        id={"edit-id"}
                                                        name={"edit-comment"}
                                                        initialValues={comment}
                                                        onFinish={(value) => editComment(index, comment.id, value.content)}
                                                    >

                                                        <Form.Item
                                                            name={"content"}
                                                            rules={[{required: true, message: "Заполните поле",
                                                                validator(rule, value, callback) {
                                                                    if (value.trim().length < 1) {
                                                                        callback("Заполните поле")
                                                                        return false;
                                                                    }

                                                                    callback()
                                                                }}]}
                                                        >
                                                            <TextArea autoSize={{minRows: 3}} style={{ marginTop: 24, fontSize: 17 }}/>
                                                        </Form.Item>
                                                    </Form> :
                                                    <span className={"f-cards-content-description"}>
                                                    {
                                                        comment?.content
                                                    }
                                                    </span>
                                                }
                                                {
                                                    comment.photo &&
                                                    <div className={"f-images-comment-wrap"}>
                                                        {
                                                            comment.photo.split(";").map(item => (
                                                                <Image
                                                                    wrapperClassName={"f-images-comment"}
                                                                    style={{borderRadius: 16, objectFit: 'contain'}}
                                                                    height={'100%'}
                                                                    src={item}
                                                                    placeholder={
                                                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'  }}>
                                                                            <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                                                        </div>
                                                                    }
                                                                />
                                                            ))
                                                        }
                                                    </div>
                                                }
                                                <div style={{color: '#AAB2BD'}}>
                                                    <span style={{fontSize: 15, fontWeight: 400}}>
                                                        {
                                                            comment?.dateString
                                                        }
                                                    </span>
                                                    {
                                                        (comment.user.id === global.user?.id || ["ROLE_ADMIN"].some(el => global.user?.roles?.includes(el))) &&
                                                        <>
                                                            <span> · </span>
                                                            {
                                                                editableId !== comment.id ?
                                                                    <>
                                                                        { comment.user.id === global.user?.id &&
                                                                            <>
                                                                                <a onClick={() => setEditableId(comment.id)}
                                                                                   style={{
                                                                                       color: editableId !== comment.id && '#AAB2BD',
                                                                                       fontSize: 15,
                                                                                       fontWeight: 400
                                                                                   }}>
                                                                                    Редактировать
                                                                                </a>
                                                                                <span> · </span>
                                                                            </>
                                                                        }
                                                                        <Popconfirm
                                                                            title="Удалить комментарий?"
                                                                            onConfirm={() => onDeleteComment(comment.id)}
                                                                            okText="Да"
                                                                            cancelText="Нет"
                                                                        >
                                                                            <a className={"of-comment-delete"} style={{
                                                                                fontSize: 15,
                                                                                fontWeight: 400,
                                                                                margin: 0,
                                                                                padding: 0
                                                                            }}>Удалить</a>
                                                                        </Popconfirm>
                                                                    </>:
                                                                    <>
                                                                        <Button loading={loadingEdit} form={"edit-id"}
                                                                                htmlType="submit" type="link"
                                                                                style={{
                                                                                    fontSize: 15,
                                                                                    fontWeight: 400,
                                                                                    margin: 0,
                                                                                    padding: 0
                                                                                }}>Сохранить</Button>
                                                                        <span> · </span>
                                                                        <a onClick={() => setEditableId(false)}
                                                                           style={{
                                                                               color: '#AAB2BD',
                                                                               fontSize: 15,
                                                                               fontWeight: 400,
                                                                               margin: 0,
                                                                               padding: 0
                                                                           }}>Отмена</a>
                                                                    </>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ))
                }
            </div>
            {
                allowComments &&
                <div className={"f-write-comments"} key={2}>
                    <Title>Написать</Title>
                    <Form form={form}
                          onFinish={(values) => sendComment(values)}
                    >
                        <Form.Item
                            name={"comment"}
                            rules={[
                                {
                                    required: true,
                                    message: 'Напишите комментарий',
                                    validator(rule, value, callback) {
                                        if (value.trim().length < 1) {
                                            callback("Напишите комментарий")
                                            return false;
                                        }

                                        callback()
                                    }
                                },
                            ]}
                        >
                            {
                                global.layout === "guest" ?
                                    <>
                                        <TextArea name={"text-area"} style={{backgroundColor: global.layout !== "guest" ? '#FFFFFF' : '#E6E9ED'}}
                                                  autoSize={{minRows: 5}}
                                                  disabled={global.layout === "guest"}
                                                  className={"f-write-comments-input"}
                                                  placeholder={global.layout !== "guest" ?
                                                      "Напишите что-нибудь..." : ""}
                                        />
                                        <div className={'disable'}><a style={{ color: '#3D72ED' }} onClick={() => setVisible(!visible)}>Войдите</a>, чтобы оставлять комментарии, публиковать и оценивать идеи</div>
                                    </> :
                                    <TextArea name={"text-area"} style={{backgroundColor: global.layout !== "guest" ? '#FFFFFF' : '#E6E9ED'}}
                                              autoSize={{minRows: 5}}
                                              disabled={global.layout === "guest"}
                                              className={"f-write-comments-input"}
                                              placeholder={global.layout !== "guest" ?
                                                  "Напишите что-нибудь..." : ""}
                                    />
                            }
                        </Form.Item>
                        {
                            global.layout !== 'guest' &&
                            <Form.Item
                                name={"photo"}
                            >
                                <Upload
                                    accept=".jpeg, .png, .jpg"
                                    action={ApiRoutes.API_UPLOAD_IMAGE}
                                    fileList={fileList}
                                    onChange={onChange}
                                    listType="picture"
                                    beforeUpload={(file) => beforeUpload(file)}
                                    maxCount={3}
                                >
                                    <Button style={{border: 'none'}} icon={<CameraOutlined/>}></Button>
                                </Upload>
                            </Form.Item>
                        }
                        {
                            ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => global?.user?.roles?.includes(el)) &&
                            <Form.Item
                                name={"close"}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Checkbox onClick={() => setChecked(!checked)} style={{ color: '#1D1D1F', fontSize: 20 }}>
                                    <span style={{ position: 'relative', top: 2 }}>Опубликовать и закрыть комментарии</span>
                                </Checkbox>
                            </Form.Item>
                        }
                        <Form.Item>
                            {
                                global.layout !== "guest" ?
                                    <Button
                                        style={{
                                            paddingRight: 27,
                                            paddingLeft: 27,
                                            boxShadow: '0px 16px 32px 4px rgba(61, 114, 237, 0.24)',
                                            borderRadius: 64,
                                            fontSize: 20,
                                            height: 60,
                                        }}
                                        type="primary"
                                        htmlType="submit"
                                        shape="round"
                                        loading={loading}
                                    >
                                        Отправить
                                    </Button>
                                    : <Button
                                        style={{
                                            paddingRight: 32,
                                            paddingLeft: 32,
                                            backgroundColor: '#E6E9ED',
                                            border: 'none',
                                            borderRadius: 64,
                                            fontSize: 20,
                                            height: 60,
                                        }}
                                        disabled={true}
                                        shape="round"
                                    >
                                        Отправить
                                    </Button>
                            }
                        </Form.Item>
                    </Form>
                </div>
            }
        </div>
    )
};

export default Comments;