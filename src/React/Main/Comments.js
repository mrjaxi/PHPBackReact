import React from "react";
import {Button, Form, Input, Skeleton, Typography} from "antd";
import axios from "axios";
const { Title } = Typography;
const { TextArea } = Input;

const Comments = ({ comments, loading, addCommentToIdea, index, item, allowComments }) => {

    const sendComment = (text) => {
        console.log(text)
        axios.post("/ideas/api/newComment/", {idea_id: item.id, content: text}).then(
            response => {
                if (response.data.state === "success"){
                    addCommentToIdea(index, response.data.comment)
                } else {
                    global.openNotification("Ошибка", response.data.error, "error")
                }
            }
        )
    };

    return (
        <div className={"f-comments"}>
            <span className={"f-comments-tip-text"}>Комментарии</span>
            <div className={"f-comments-scroll"}>
                {
                    comments.length === 0 ? (
                        <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{ marginTop: 20 }}>
                            <span className={"f-cards-content-description"}>
                                Пока нет комментариев
                            </span>
                        </div>
                    ) :
                    loading ? <Skeleton active style={{ width: '100%', height: '200px' }} />:
                    comments.map(comment => (
                        <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{ marginTop: 20 }}>
                            <div className={"f-cards-row-wrap"}>
                                <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                <div className={"f-cards-wrap-text"}>
                                    <span className={"f-cards-text"}>{comment.user.first_name + " " + (comment.user.last_name ? comment.user.last_name : "") }
                                        {
                                            comment.user.roles.includes("ROLE_ADMIN") &&
                                            <img style={{ marginBottom: 3, marginLeft: 5 }} src={"/i/official.svg"} width={15} height={15}/>
                                        }
                                    </span>
                                    <span className={"f-cards-content-description"}>
                                    {
                                        comment.content
                                    }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            {
                allowComments &&
                <div className={"f-write-comments"}>
                    <Title>Написать</Title>
                    <Form
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
                            onChange={(e) => console.log(e.target.value)}
                        >
                            <TextArea style={{ backgroundColor: '#FFFFFF' }} className={"f-write-comments-input"} placeholder={global.layout !== "guest" ?
                                "Напишите что-нибудь..." : "Войти, чтобы оставлять комментарии, публиковать и оценивать идеи"}/>
                        </Form.Item>
                        <Form.Item>
                            {
                                global.layout !== "guest" ?
                                <Button className={"f-write-comments-button"} type="primary" htmlType="submit" shape="round">Отправить</Button> :
                                    <Button onClick={() => { global._history.replace(global.lang + "/auth/") }} className={"f-write-comments-button"} type="primary" htmlType="submit" shape="round">Войти</Button>
                            }
                        </Form.Item>
                    </Form>
                </div>
            }
        </div>
    )
};

export default Comments;