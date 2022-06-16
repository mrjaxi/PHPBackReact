import React, {useEffect, useLayoutEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../../Routes/ApiRoutes";
import Comments from "../../Comments";
import {Avatar, Select, Tooltip} from "antd";
import {NavLink} from "react-router-dom";
import {UserOutlined} from "@ant-design/icons";
import { Image } from 'antd';
const {Option} = Select;

const IdeaItem = ({ item, index, setItem, statuses, selectType = () => false }) => {

    const [idea, setIdea] = useState(item);
    const [date, setDate] = useState("")
    const [visible, setVisible] = useState(false);

    let editable = false
    let months = ["января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"];

    useLayoutEffect(() => {
        let dateItem = new Date(item?.date)
        let dateString = `${Number(dateItem.getUTCDate())} ${months[dateItem.getUTCMonth()]} ${dateItem.getUTCFullYear()}`
        setDate(dateString)
    }, [])

    useEffect(() => {
        if(editable){
            setItem(idea, index)
        } else {
            editable = true
        }
    }, [idea]);

    const setIdeaComments = (comments) => {
        let newIdea = {...idea};
        newIdea.comments = comments;
        setIdea(newIdea)
    };

    const newVote = (id, currentUserIsVote) => {
        switch (currentUserIsVote) {
            case "unauthorized":
                global.openNotification("Войдите", "Чтобы проголосовать нужно авторизоваться", "error")
                break;
            case true:
                let newIdea = {...idea};
                newIdea.like -= 1;
                newIdea.currentUserIsVote = !currentUserIsVote;
                setIdea(newIdea);
                axios.post(ApiRoutes.API_DELETE_VOTE, {idea_id: id})
                    .then(response => {
                        switch (response.data?.state) {
                            case "success":
                                break;
                            case "error":
                                global.openNotification("Ошибка", response.data?.message, "error")
                                let newIdea1 = {...newIdea};
                                newIdea1.like += 1;
                                newIdea1.currentUserIsVote = !newIdea1.currentUserIsVote;
                                setIdea(newIdea1)
                                break;
                            default:
                                global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                                break;
                        }
                    })
                break;
            case false:
                let newIdea1 = {...idea};
                newIdea1.like += 1;
                newIdea1.currentUserIsVote = !currentUserIsVote;
                setIdea(newIdea1);
                axios.post(ApiRoutes.API_NEW_VOTE, {idea_id: id, type: "like"})
                    .then(response => {
                        switch (response.data?.state) {
                            case "success":
                                break;
                            case "error":
                                global.openNotification("Ошибка", response.data?.message, "error")
                                let newIdea2 = {...newIdea1};
                                newIdea2.like -= 1;
                                newIdea2.currentUserIsVote = !newIdea2.currentUserIsVote;
                                setIdea(newIdea2);
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
                <text className={"f-cards-hashtag"} style={{
                    marginBottom: "1em"
                }}>{date}</text>
                <p className={"f-cards-hashtag " + (selectType() && "f-cards-hashtag-hover")}
                   onClick={() => {
                       // console.log(`selectType(${idea.typeId})`)
                       selectType(idea.typeId)
                   }}>#{idea?.type}</p>
                <div className={"f-cards-card-wrap"}>
                    {
                        idea?.photo !== null &&
                        <div className={"f-cards-image-type"}
                             onClick={() => setVisible(true)}
                             style={{backgroundImage: 'url("' + idea?.photo.split(";")[0] + '")', cursor: 'pointer'}}>
                            <div
                                style={{
                                    display: 'none',
                                }}
                            >
                                <Image.PreviewGroup
                                    preview={{
                                        visible,
                                        onVisibleChange: (vis) => setVisible(vis),
                                    }}
                                >
                                    {
                                        idea?.photo.split(";").map(item => (
                                            <Image src={item} />
                                        ))
                                    }
                                </Image.PreviewGroup>
                            </div>
                        </div>
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
                                    <Select
                                        size={'large'}
                                        onSelect={(id, data) => {
                                            changeStatus(idea.idea_id, id, data)
                                        }}
                                        defaultValue={idea.status.id}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: "center",
                                        }}
                                    >
                                        {
                                            statuses.map(status => (
                                                <Option data={status.name}
                                                        value={status.id}>{status.translate}</Option>
                                            ))
                                        }
                                    </Select> :
                                    <div>
                                        <p className={"f-cards-type f-cards-type-viewed"} style={{
                                            // marginTop: "1em",
                                            color: idea.status?.color ? idea.status?.color : "#000000",
                                            backgroundColor: idea.status?.color ? idea.status?.color + "30" : "#AAB2BD",
                                        }}
                                        >{idea.status.translate}</p>
                                    </div>
                            }
                        </div>

                        <div className={"f-cards-div-wrap-text"}>
                            <NavLink to={global.lang + "/idea/" + idea.idea_id}>
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
                                {
                                    global.layout === 'guest' ?
                                    <Tooltip color={"black"} title="Авторизуйтесь, чтобы оценить">
                                        <button disabled={true} type={"button"} style={{
                                            backgroundColor: 'white',
                                            cursor: 'not-allowed',
                                            border: 'none',
                                        }}
                                           className={"f-cards-under-block-like"}
                                           onClick={() => newVote(idea.idea_id, idea.currentUserIsVote)}>
                                            <i className="em em---1"
                                               aria-label="THUMBS UP SIGN"></i>
                                            <span style={{ color: idea.currentUserIsVote === true ? "#FFF" : "" }} className={"f-cards-under-block-like-text"}>{idea.like}</span>
                                        </button>
                                    </Tooltip> :
                                    <button type={"button"} style={{backgroundColor: idea.currentUserIsVote === true ? "#3D72ED" : "", border: 'none', cursor: 'pointer'}}
                                       className={"f-cards-under-block-like"}
                                       onClick={() => newVote(idea.idea_id, idea.currentUserIsVote)}>
                                        <i className="em em---1"
                                           aria-label="THUMBS UP SIGN"></i>
                                        <span style={{ color: idea.currentUserIsVote === true ? "#FFF" : "" }} className={"f-cards-under-block-like-text"}>{idea.like}</span>
                                    </button>
                                }
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