import React, {useEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import FlatList from "flatlist-react";
import {NavLink} from "react-router-dom";
import {Avatar} from "antd";
import {UserOutlined} from "@ant-design/icons";
import Linkify from "react-linkify";

const UserComments = ({ user_id }) => {

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    let commentsData = [];

    useEffect(() => {
        getUserComments()
    }, []);

    const getUserComments = () => {
        setLoading(true)
        axios.get(ApiRoutes.API_GET_USER_DATA.format(user_id) + "?" + global.serialize({page: "2"})).then(response => {
            if (response.data.state === "success" && response.data?.comments) {
                response.data.comments.map(comment => {
                    let newComment = {
                        id: comment.id,
                        date: global.getDateString(new Date(comment?.date)),
                        photo: comment.user.image,
                        content: comment.content,
                        roles: comment.user.roles,
                        role: comment.user.role_name,
                        username: comment.user?.first_name,
                        ideaId: comment?.idea_id,
                    }
                    commentsData.push(newComment)
                })
            }
            setComments(commentsData);
            setLoading(false)
        })
    };

    return (
        <>
            <div className={"max_width"}
                 style={{ paddingTop: 50 }}
            >
                <div style={{
                    display: "flex",
                    justifyContent: 'center',
                    flexDirection: "column",
                    alignItems: "center",
                    width: '50vw'
                }}>
                    { loading ? <LoadingIdeas/> :
                        <FlatList
                            list={comments}
                            renderItem={(comment, index) => {
                                return (
                                    <div className={"f-cards"} id={index} style={{ marginBottom: "50px" }}
                                    >
                                        <div>
                                            <div className={"f-cards-card-wrap"}>
                                                <NavLink to={"/idea/" + comment.ideaId}>
                                                    <div className={"f-cards-inner"}>
                                                        <div className={"f-cards-avatar"}>
                                                            <div className={"f-cards-row-wrap"}>
                                                                <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
                                                                        src={comment.photo
                                                                            ? <img src={comment.photo}/>
                                                                            : <UserOutlined/>
                                                                        }/>
                                                                <div className={"f-cards-wrap-text-style"}>
                                                                    <span className={"f-cards-text"}>{comment.username}
                                                                        {
                                                                            comment.roles.includes("ROLE_ADMIN") &&
                                                                            <img style={{marginBottom: 3, marginLeft: 5}}
                                                                                 src={"/i/official.svg"} width={15}
                                                                                 height={15}/>
                                                                        }
                                                                    </span>
                                                                    <span className={"f-cards-text-bottom"}>{comment.role}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                textAlign: "center",
                                                                justifyContent: 'center',
                                                            }}>
                                                                <p className={"f-cards-type f-cards-type-viewed"} style={{
                                                                    flex: 1,
                                                                    padding: "5px",
                                                                    // color: "#000000",
                                                                }}
                                                                >{comment?.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className={"f-cards-div-wrap-text"}>
                                                        <span className={"f-cards-content-text"}>
                                                            <Linkify>
                                                                { comment?.content }
                                                            </Linkify>
                                                        </span>
                                                        </div>
                                                    </div>
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }}
                            renderWhenEmpty={() =>
                                <div className={"f-cards"}>
                                    <div>
                                        <div className={"f-cards-card-wrap"}>
                                            <div className={"f-cards-inner"}>
                                                <div className={"f-cards-div-wrap-text"}>
                                                <span className={"f-cards-content-text"}>
                                                    <div>Вы пока не написали ни одного комментария...</div>
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    }
                </div>
            </div>
        </>
    )
};
export default UserComments;