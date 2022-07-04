import React, {useLayoutEffect, useState} from "react";
import {Avatar, Button, Form, Input, Skeleton, Typography} from "antd";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import {UserOutlined} from "@ant-design/icons";
import Login from "../Auth/Login";
import {Link} from "react-router-dom";

const {Title} = Typography;
const {TextArea} = Input;

const Comments = ({comments, setComments, idea, index, allowComments, flag}) => {

    const [form] = Form.useForm();
    const [showComments, setShowComments] = useState(true);
    const [commentsData, setCommentsData] = useState(comments.filter((item, index) => index < 3));
    const [rawCommentsData, setRawCommentsData] = useState(comments);
    const [visible, setVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    const sendComment = (text) => {
        if (text.trim() !== ""){
            setLoading(true)
            axios.post(ApiRoutes.API_NEW_COMMENT, {idea_id: idea?.idea_id, content: text})
                .then( response => {
                        global.handleResponse(response,
                            function () {
                                form.resetFields()
                                let data = [...rawCommentsData];
                                data.push({...response.data?.comment, dateString: global.getDateString(new Date())});
                                setCommentsData(data);
                                setRawCommentsData(data);
                                setComments(data)
                                setShowComments(false)
                            },
                            function () {
                                global.openNotification("Ошибка", response.data?.message, "error")
                            },
                        );
                        setLoading(false);
                    }
                )
        }
    };

    return (
        <div className={"f-comments"}>
            <Login visible={visible} setVisible={setVisible}/>
            <span className={"f-comments-tip-text"}>Комментарии</span>
            <div className={"f-comments-scroll"}>
                {
                    flag ? <></> :
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
                                        key={index}
                                        className={"f-cards-avatar f-cards-avatar-bottom-border"}
                                        style={{paddingTop: 40, display: "block",}}
                                    >
                                        <div className={"f-cards-row-wrap"}>
                                            <Link to={global.lang + `/profile/${comment.user.id}`}>
                                                <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
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
                                                    <Link to={global.lang + `/profile/${comment.user.id}`}>
                                                        <span style={{color: "black"}}>
                                                            {(comment.user?.first_name + " " + (comment.user?.last_name ? comment.user?.last_name : "")).trim()}
                                                            {
                                                                ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => comment?.user.roles.includes(el)) &&
                                                                <img style={{marginBottom: 3, marginLeft: 5}} src={"/i/official.svg"}
                                                                     width={15} height={15}/>
                                                            }
                                                        </span>
                                                    </Link>
                                                    {/*{*/}
                                                    {/*    <span style={{ color: '#AAB2BD', fontSize: 15, marginLeft: 10, fontWeight: 400 }}>ред.</span>*/}
                                                    {/*}*/}
                                                </span>
                                                <span className={"f-cards-content-description"}>
                                                    {
                                                        comment?.content
                                                    }
                                                </span>
                                                <span style={{color: '#AAB2BD', fontSize: 15, fontWeight: 400}}>
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
                <div className={"f-write-comments"} key={2}>
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