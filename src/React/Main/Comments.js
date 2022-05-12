import React from "react";
import {Button, Form, Input, Skeleton, Typography} from "antd";
import axios from "axios";
const { Title } = Typography;
const { TextArea } = Input;

const Comments = ({ comments, loading, addCommentToIdea, index, item }) => {

    const sendComment = (text) => {
        console.log(text)
        axios.post("http://127.0.0.1:8000/ideas/api/newComment/", {idea_id: item.id, content: text}).then(
            response => {
                console.log(response.data)
                if (response.data.state === "success"){
                    addCommentToIdea(index, response.data.comment.id, text.trim(), response.data.comment.date)
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
                                    <span className={"f-cards-text"}>Константин Константинопольский</span>
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
                    >
                        <TextArea className={"f-write-comments-input"} placeholder={"Напишите что-нибудь..."}/>
                    </Form.Item>
                    <Form.Item>
                        <Button className={"f-write-comments-button"} type="primary" htmlType="submit" shape="round">Отправить</Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
};

export default Comments;