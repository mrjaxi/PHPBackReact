import React, {useLayoutEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Avatar, Button, Form, Image, Input, Popconfirm, Spin} from "antd";
import {LoadingOutlined, UserOutlined} from "@ant-design/icons";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
const {TextArea} = Input;

const OfficialComment = ({commentData, onDeleteComment, idea, setIdea}) => {

    const [editableId, setEditableId] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const [comment, setComment] = useState(commentData);

    const editComment = (commentID, newValue) => {
        setLoadingEdit(true)
        if (newValue.trim() !== ""){
            axios.post(ApiRoutes.API_CHANGE_COMMENT, {comment_id: commentID, content: newValue}).then(response => {
                global.handleResponse(response,
                    function () {
                        let newIdea = {...idea}
                        let newComment = {...comment};
                        newComment.content = newValue;
                        newComment.updated = true;
                        newIdea.officialComment = newComment
                        newIdea.comments.map((comment, index) => {
                            if(comment.id === newComment.id){
                                comment.content = newValue;
                                comment.updated = true;
                            }
                        })
                        setComment(newComment);
                        setIdea(newIdea);
                        setEditableId(false);
                        setLoadingEdit(false)
                        global.openNotification("Успешно", "Комментарий отредактирован", "success")
                    },
                    function () {
                        global.openNotification("Ошибка", "Невозможно редактировать комментарий", "error")
                    },
                )
            })
        }
    };

    return (
        <div className={"of-comment"}>
            <div
                className={"f-cards-avatar"}
                style={{paddingTop: 30, display: "block",}}
            >
                <div className={"f-cards-row-wrap"}>
                    <div className={"f-cards-wrap-text f-padding-official"}>
                        <span
                            className={"f-cards-text"}
                            style={{justifyContent: "flex-start", marginBottom: 20}}
                        >
                            <Link to={global.lang + `/profile/${comment.user.id}/`}>
                                <div className={"f-cards-row-wrap"}>
                                    <Avatar size={48} style={{minWidth: 48, minHeight: 48,backgroundColor: '#AAB2BD'}}
                                            src={comment.user.image
                                                ? <img src={comment.user.image}/>
                                                : <UserOutlined/>
                                            }/>
                                    <div className={"f-cards-wrap-text-style"}>
                                        <div>
                                            <span className={"f-cards-text"}>
                                                <p className={"f-fio-text"}>
                                                {(comment.user?.first_name + " " + (comment.user?.last_name ? comment.user?.last_name : "")).trim()}
                                                    {
                                                        ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => comment?.user.roles.includes(el)) &&
                                                        <img style={{marginBottom: 3, marginLeft: 5}}
                                                             src={"/i/official.svg"} width={15}
                                                             height={15}/>
                                                    }
                                                    {
                                                        comment.updated &&
                                                        <span style={{
                                                            color: '#AAB2BD',
                                                            fontSize: 15,
                                                            marginLeft: 10,
                                                            fontWeight: 400,
                                                            marginBottom: 5
                                                        }}>ред.</span>
                                                    }
                                                </p>
                                            </span>
                                        </div>
                                        <span className={"f-cards-text-bottom"}>{comment.user.role_name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </span>
                        {
                            editableId === comment.id ?
                                <Form
                                    id={"edit-id"}
                                    name={"edit-comment"}
                                    initialValues={comment}
                                    onFinish={(value) => editComment(comment.id, value.content)}
                                >

                                    <Form.Item
                                        name={"content"}
                                        rules={[{required: true, message: "Заполните поле"}]}
                                    >
                                        <TextArea autoSize={{minRows: 3}} style={{ width: '100%' }}/>
                                    </Form.Item>
                                </Form> :
                                <span className={"f-cards-content-description"}>
                                    {
                                        comment?.content.split("\n").map(item => {
                                            if (item) {
                                                return (
                                                    <p style={{marginBottom: 2}}>{item}</p>
                                                )
                                            }
                                        })
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
                        <div style={{color: '#AAB2BD', marginTop: 10}}>
                            <span style={{fontSize: 15, fontWeight: 400}}>
                                {
                                    global.getDateString(new Date(comment?.date))
                                }
                            </span>
                            {
                                comment.user.id === global.user.id &&
                                <>
                                    <span> · </span>
                                    {
                                        editableId !== comment.id ?
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
                                                <Popconfirm
                                                    title="Удалить комментарий?"
                                                    onConfirm={() => onDeleteComment(comment.id, true)}
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
                                                            padding: 0,
                                                            height: '100%'
                                                        }}>Сохранить</Button>
                                                <span> · </span>
                                                <Button type="link" onClick={() => setEditableId(false)}
                                                   style={{
                                                       color: '#AAB2BD',
                                                       fontSize: 15,
                                                       fontWeight: 400,
                                                       margin: 0,
                                                       padding: 0,
                                                       height: '100%'
                                                   }}>Отмена</Button>
                                            </>
                                    }
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default OfficialComment;