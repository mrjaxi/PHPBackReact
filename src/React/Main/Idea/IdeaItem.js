import React, {useEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import Comments from "../Comments";
import {Avatar, Select} from "antd";
import { NavLink } from "react-router-dom";
import {UserOutlined} from "@ant-design/icons";
const  { Option } = Select;

const IdeaItem = ({item, index, setItem, statuses, updateStatuses}) => {

    const [idea, setIdea] = useState(item)

    useEffect(() => {
        console.log(idea)
        setItem(idea, index)
    }, [idea])

    const setIdeaComments = (comments) => {
        let newIdea = {...idea}
        newIdea.comments = comments
        console.log("setNewIdea:", idea)
        setIdea(newIdea)
    }

    const newVote = (id, currentUserIsVote) => {
        switch (currentUserIsVote) {
            case "unauthorized":
                global.openNotification("Войдите", "Чтобы проголосовать нужно авторизоваться", "error")
                break;
            case true:
                axios.post(ApiRoutes.API_DELETE_VOTE, {idea_id: id})
                    .then(response => {
                        switch (response.data?.state) {
                            case "success":
                                let newIdea = {...idea};
                                newIdea.like -= 1;
                                newIdea.currentUserIsVote = !currentUserIsVote;
                                setIdea(newIdea)
                                break;
                            case "error":
                                global.openNotification("Ошибка", response.data?.message, "error")
                                break;
                            default:
                                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                                break;
                        }
                    })
                break;
            case false:
                axios.post(ApiRoutes.API_NEW_VOTE, {idea_id: id, type: "like"})
                    .then(response => {
                        switch (response.data?.state) {
                            case "success":
                                let newIdea = {...idea};
                                newIdea.like += 1;
                                newIdea.currentUserIsVote = !currentUserIsVote;
                                setIdea(newIdea)
                                break;
                            case "error":
                                global.openNotification("Ошибка", response.data?.message, "error")
                                break;
                            default:
                                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                                break;
                        }
                    })
                break;
            default:
                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                break;
        }
    };

    const showText = (show) => {
        let newIdea = {...idea};
        newIdea.showFullText = !show;
        setIdea(newIdea)
    };

    const showComments = () => {
        let newIdea = {...idea};
        const flag = newIdea.showComments;
        newIdea.showComments = !flag;
        setIdea(newIdea)
    };

    const changeStatus = (idea_id, id, name) => {
        axios.post(ApiRoutes.API_SET_STATUS, {idea_id: idea_id, status_id: id})
            .then(response => {
                switch (response.data?.state) {
                    case "success":
                        global.openNotification("Успешно", "Статус идеи изменен", "success")
                        let newIdea = {...idea};
                        newIdea.status = id;
                        if (name.data === "declined" || name.data === "completed") {
                            newIdea.allowComments = false;
                        } else {
                            newIdea.allowComments = true;
                        }
                        setIdea(newIdea)
                        updateStatuses()
                        break;
                    case "error":
                        global.openNotification("Ошибка", response.data?.message, "error")
                        break;
                    default:
                        global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                        break;
                }
            })
    };

    return (
        <>
            <div className={"f-cards"} key={index} id={index}>
                <p style={{marginLeft: 40}} className={"f-cards-hashtag"}>#{idea?.type}</p>
                <div className={"f-cards-card-wrap"}>
                    {
                        idea.photo !== null &&
                        <div className={"f-cards-image-type"}
                             style={{backgroundImage: 'url("' + idea.photo.split(";")[0] + '")'}}/>
                    }
                    <div className={"f-cards-inner"}>
                        <div className={"f-cards-avatar"}>
                            <div className={"f-cards-row-wrap"}>
                                <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
                                        src={idea.userImage
                                            ? <img src={idea.userImage}/>
                                            : <UserOutlined/>
                                        }/>
                                <div className={"f-cards-wrap-text"}>
                                        <span className={"f-cards-text"}>{idea.username}
                                            {
                                                idea.roles.includes("ROLE_ADMIN") &&
                                                <img style={{marginBottom: 3, marginLeft: 5}}
                                                     src={"/i/official.svg"} width={15}
                                                     height={15}/>
                                            }
                                        </span>
                                    <span className={"f-cards-text-bottom"}>{idea.role}</span>
                                </div>
                            </div>
                            {
                                global.layout === "admin" ?
                                    <Select onSelect={(id, data) => {
                                        changeStatus(idea.idea_id, id, data), updateStatuses()
                                    }} defaultValue={idea.status.id} style={{
                                        justifyContent: 'center',
                                        alignItems: "center",
                                    }}>
                                        {
                                            statuses.map(status => (
                                                <Option data={status.name}
                                                        value={status.id}>{status.translate}</Option>
                                            ))
                                        }
                                    </Select> :
                                    <div style={{
                                        textAlign: "center",
                                        justifyContent: 'center',
                                    }}>
                                        <p className={"f-cards-type f-cards-type-viewed"} style={{
                                            flex: 1,
                                            padding: "5px",
                                            color: idea.status?.color ? idea.status?.color : "#000000",
                                            backgroundColor: idea.status?.color ? idea.status?.color + "30" : "#AAB2BD",
                                        }}
                                        >{idea.status.translate}</p>
                                    </div>
                            }
                        </div>

                        <div className={"f-cards-div-wrap-text"}>
                            <NavLink to={"/idea/" + idea.idea_id}>
                                     <span className={"f-cards-content-text"}>
                                         {idea.title}
                                     </span>
                            </NavLink>
                        </div>

                        <div className={"f-cards-div-wrap-text"}>
                                <span className={"f-cards-content-description"}>
                                    {
                                        idea.text.split(" ").length < 25 ?
                                            <span>{idea.text}</span> :
                                            idea.text.split(" ").length > 25 && !idea.showFullText ?
                                                <span>{idea.text.split(" ").filter((idea, index) => index < 25).join(" ")}... <a
                                                    onClick={() => showText(idea.showFullText)}>Еще</a></span> :
                                                <span>{idea.text} <a style={{zIndex: 3}}
                                                                     onClick={() => showText(idea.showFullText)}>Скрыть</a></span>
                                    }
                                </span>
                        </div>
                        <div className={"f-cards-under-block"}>
                            <div>
                                <a onClick={() => {
                                    showComments()
                                }} className={"f-cards-under-block-comment"}>
                                    {global.numWord(idea.comments.length, ["комментарий", "комментария", "комментариев"])}
                                </a>
                            </div>
                            <div>
                                <a style={{backgroundColor: idea.currentUserIsVote === true ? "#90EE90" : ""}}
                                   className={"f-cards-under-block-like"}
                                   onClick={() => newVote(idea.idea_id, idea.currentUserIsVote)}>
                                    <i className="em em---1"
                                       aria-label="THUMBS UP SIGN"></i>
                                    <span className={"f-cards-under-block-like-text"}>{idea.like}</span>
                                </a>
                            </div>
                            {/*<div>*/}
                            {/*    <a className={"f-cards-under-block-like"} href={"#"}>*/}
                            {/*        <i className="em em--1"*/}
                            {/*           aria-label="THUMBS DOWN SIGN"></i>*/}
                            {/*        <span className={"f-cards-under-block-like-text"}>Не нравится</span>*/}
                            {/*    </a>*/}
                            {/*</div>*/}
                        </div>
                        {
                            idea.showComments &&
                            <Comments allowComments={idea.allowComments} idea={idea} index={index}
                                      comments={idea.comments} setComments={setIdeaComments}/>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default IdeaItem;