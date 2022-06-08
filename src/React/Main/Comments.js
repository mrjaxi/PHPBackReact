import React, {useState} from "react";
import {Button, Form, Input, Skeleton, Typography} from "antd";
import axios from "axios";
import ApiRoutes from "../Routes/ApiRoutes";

const {Title} = Typography;
const {TextArea} = Input;

const Comments = ({comments, setComments, loading, idea, index, allowComments}) => {

    const [form] = Form.useForm();
    const [showComments, setShowComments] = useState(true);
    const [commentsData, setCommentsData] = useState(comments.filter((item, index) => index < 3));
    const [rawCommentsData, setRawCommentsData] = useState(comments);

    const sendComment = (text) => {
        axios.post(ApiRoutes.API_NEW_COMMENT, {idea_id: idea.idea_id, content: text}).then(
            response => {
                if (response.data.state === "success") {
                    form.resetFields()
                    let data = [...rawCommentsData];
                    data.push(response.data.comment);
                    setCommentsData(data);
                    setRawCommentsData(data);
                    setComments(data)
                    setShowComments(false)
                } else {
                    global.openNotification("Ошибка", response.data.error, "error")
                }
            }
        )
    };

    return (
        <div className={"f-comments"}>
            <div className={"f-comments-scroll"}>
                {
                    commentsData.length === 0 ? (
                            <div className={"f-cards-avatar f-cards-avatar-bottom-border"} style={{marginTop: 20}}>
                            <span className={"f-cards-content-description"}>
                                Вы можете оставить первый комментарий
                            </span>
                            </div>
                        ) :
                        loading ? <Skeleton active style={{width: '100%', height: '200px'}}/> :
                            commentsData.map((comment, index) => (
                                <>
                                    <div className={"f-cards-avatar f-cards-avatar-bottom-border"}
                                         style={{marginTop: 20}}>
                                        <div className={"f-cards-row-wrap"}>
                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                            <div className={"f-cards-wrap-text"}>
                                        <span
                                            className={"f-cards-text"}>{comment.user.first_name + " " + (comment.user.last_name ? comment.user.last_name : "")}
                                            {
                                                comment.user.roles.includes("ROLE_ADMIN") &&
                                                <img style={{marginBottom: 3, marginLeft: 5}} src={"/i/official.svg"}
                                                     width={15} height={15}/>
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
                                    {
                                        (rawCommentsData.length > 3 && index === commentsData.length-1) &&
                                        <div style={{
                                            display: 'flex',
                                            width: '100%',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 17
                                        }}>
                                            <a onClick={() => {
                                                if(index === 2 && showComments){
                                                    setCommentsData(rawCommentsData), setShowComments(false)
                                                }
                                                if(index === rawCommentsData.length-1 && !showComments){
                                                    setCommentsData(rawCommentsData.filter((item, index) => index < 3)), setShowComments(true)
                                                }
                                            }}>{(index === 2 && showComments) ? "Загрузить еще": "Скрыть"}</a>
                                        </div>
                                    }
                                    {/*{*/}
                                    {/*    (index === 2 && showComments && rawCommentsData.length > 3) &&*/}
                                    {/*    <div style={{*/}
                                    {/*        display: 'flex',*/}
                                    {/*        width: '100%',*/}
                                    {/*        alignItems: 'center',*/}
                                    {/*        justifyContent: 'center',*/}
                                    {/*        fontSize: 17*/}
                                    {/*    }}>*/}
                                    {/*        <a onClick={() => {*/}
                                    {/*            setCommentsData(rawCommentsData), setShowComments(false)*/}
                                    {/*        }}>Загрузить еще</a>*/}
                                    {/*    </div>*/}
                                    {/*}*/}
                                    {/*{*/}
                                    {/*    (index === commentsData.length-1 && !showComments && rawCommentsData.length > 3) &&*/}
                                    {/*    <div style={{*/}
                                    {/*        display: 'flex',*/}
                                    {/*        width: '100%',*/}
                                    {/*        alignItems: 'center',*/}
                                    {/*        justifyContent: 'center',*/}
                                    {/*        fontSize: 17*/}
                                    {/*    }}>*/}
                                    {/*        <a onClick={() => {*/}
                                    {/*            setCommentsData(rawCommentsData.filter((item, index) => index < 3)), setShowComments(true)*/}
                                    {/*        }}>Скрыть</a>*/}
                                    {/*    </div>*/}
                                    {/*}*/}
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
                            <TextArea clearableInput={true} style={{backgroundColor: '#FFFFFF'}} disabled={global.layout === "guest"}
                                      autoSize={true} className={"f-write-comments-input"} placeholder={global.layout !== "guest" ?
                                "Напишите что-нибудь..." : "Войдите, чтобы оставлять комментарии, публиковать и оценивать идеи"}/>
                        </Form.Item>
                        <Form.Item>
                            {
                                global.layout !== "guest" ?
                                    <Button className={"f-write-comments-button"} type="primary" htmlType="submit" shape="round"
                                    >Отправить</Button>
                                    : <Button onClick={() => {
                                        global._history.replace(global.lang + "/auth/")
                                    }} className={"f-write-comments-button"} type="primary" htmlType="submit" shape="round">Войти</Button>
                            }
                        </Form.Item>
                    </Form>
                </div>
            }
        </div>
    )
};

export default Comments;