import React, {useLayoutEffect, useState} from "react";
import {Avatar, Button, Form, Input, Skeleton, Typography} from "antd";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import {UserOutlined} from "@ant-design/icons";
import Login from "../Auth/Login";

const {Title} = Typography;
const {TextArea} = Input;

const Comments = ({comments, setComments, idea, index, allowComments}) => {

    const [form] = Form.useForm();
    const [showComments, setShowComments] = useState(true);
    const [commentsData, setCommentsData] = useState(comments.filter((item, index) => index < 3));
    const [rawCommentsData, setRawCommentsData] = useState(comments);
    const [visible, setVisible] = useState(false);

    const sendComment = (text) => {
        axios.post(ApiRoutes.API_NEW_COMMENT, {idea_id: idea?.idea_id, content: text})
            .then( response => {
                if (response.data.state === "success") {
                    form.resetFields()
                    let data = [...rawCommentsData];
                    data.push({...response.data?.comment, dateString: global.getDateString(new Date(), false,false)});
                    setCommentsData(data);
                    setRawCommentsData(data);
                    setComments(data)
                    setShowComments(false)
                } else if(response.data.state === "error") {
                    global.openNotification("Ошибка", response.data?.message, "error")
                } else {
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                }
            }
        )
    };

    return (
        <div className={"f-comments"}>
            <Login visible={visible} setVisible={setVisible}/>
            <span className={"f-comments-tip-text"}>Комментарии</span>
            <div className={"f-comments-scroll"}>
                {
                    commentsData.length === 0 ? (
                            <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{marginTop: 20}}>
                            <span className={"f-cards-content-description"}>{
                                allowComments ? "Вы можете оставить первый комментарий" : "Комментариев нет"
                            }</span>
                            </div>
                        ) :
                            commentsData.map((comment, index) => (
                                <>
                                    <div
                                        className={"f-cards-avatar f-cards-avatar-bottom-border"}
                                        style={{paddingTop: 40}}
                                    >
                                        <div className={"f-cards-row-wrap"}>
                                            <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
                                                    src={comment.user.image
                                                        ? <img src={comment.user.image}/>
                                                        : <UserOutlined/>
                                                    }/>
                                            <div className={"f-cards-wrap-text"}>
                                                <span
                                                    className={"f-cards-text"}
                                                    style={{ justifyContent: "flex-start" }}
                                                >
                                                    <span>
                                                        {comment.user?.first_name + " " + (comment.user?.last_name ? comment.user?.last_name : "")}
                                                        {
                                                            comment?.user.roles.includes("ROLE_ADMIN") &&
                                                            <img style={{marginBottom: 3}} src={"/i/official.svg"}
                                                                 width={15} height={15}/>
                                                        }
                                                    </span>
                                                    {
                                                        <span style={{ color: '#AAB2BD', fontSize: 15, marginLeft: 10, fontWeight: 400 }}>ред.</span>
                                                    }
                                                </span>
                                                <span className={"f-cards-content-description"}>
                                                    {
                                                        comment?.content
                                                    }
                                                </span>
                                                <span style={{ color: '#AAB2BD', fontSize: 15, fontWeight: 400 }}>
                                                    {
                                                        comment?.dateString
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        (rawCommentsData.length > 3 && index === commentsData.length - 1) &&
                                        <div className={"f-comments-under-text"}>
                                            <a
                                                className={"f-comments-text-button"}
                                                onClick={() => {
                                                if (index === 2 && showComments) {
                                                    setCommentsData(rawCommentsData), setShowComments(false)
                                                }
                                                if (index === rawCommentsData.length - 1 && !showComments) {
                                                    setCommentsData(rawCommentsData.filter((item, index) => index < 3)), setShowComments(true)
                                                }
                                            }}>{(index === 2 && showComments) ? "Показать следующие комментарии" : "Скрыть"}</a>
                                        </div>
                                    }
                                </>
                            ))
                }
            </div>
            {
                allowComments &&
                <div className={"f-write-comments"}>
                    <Title>Написать</Title>
                    <Form form={form}
                          onFinish={(values) => sendComment(values.comment)}
                    >
                        <Form.Item
                            name={"comment"}
                            rules={[
                                {
                                    required: true,
                                    message: 'Напишите комментарий',
                                },
                            ]}
                        >
                            <TextArea clearableInput={true} style={{backgroundColor: '#FFFFFF'}}
                                      disabled={global.layout === "guest"}
                                      autoSize={true} className={"f-write-comments-input"}
                                      placeholder={global.layout !== "guest" ?
                                          "Напишите что-нибудь..." : "Войдите, чтобы оставлять комментарии, публиковать и оценивать идеи"}/>
                        </Form.Item>
                        <Form.Item>
                            {
                                global.layout !== "guest" ?
                                    <Button
                                        className={"f-write-comments-button"}
                                        type="primary"
                                        htmlType="submit"
                                        shape="round"
                                    >
                                        Отправить
                                    </Button>
                                    : <Button
                                        onClick={() => setVisible(!visible)}
                                        className={"f-write-comments-button"}
                                        type="primary"
                                        shape="round"
                                    >
                                        Войти
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