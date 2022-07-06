import React, {useEffect, useLayoutEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../../Routes/ApiRoutes";
import Comments from "../Comments";
import {Avatar, Image, Select, Tooltip, Button, Popover, Segmented} from "antd";
import {Link} from "react-router-dom";
import Icon, {UserOutlined} from "@ant-design/icons";
import Linkify from 'react-linkify';
const {Option} = Select;

import Like from '/public/i/like.svg'
import OfficialComment from "../OfficialComment";

global.parseToIdeaItems = (ideas, data=[], showComments=false, allowComments=null) => {
    let newData = [...data]
    ideas?.map(idea => {
        newData.push({
            idea_id: idea.id,
            title: idea.title,
            text: idea.content,
            showComments: showComments,
            showFullText: false,
            roles: idea.user.roles,
            role: idea.user.role_name,
            status: idea.status,
            photo: idea.photo,
            comments: idea.comments,
            like: Number(idea.likes),
            dislike: 0,
            user: idea.user,
            officialComment: idea.officialComment,
            username: idea.user?.first_name,
            userImage: idea.user.image,
            categoryId: idea.category.id,
            category: idea.category.name,
            type: idea.type.name,
            typeId: idea.type.id,
            currentUserIsVote: idea.currentUserIsVote,
            allowComments: allowComments===null ? idea.allowComments : allowComments,
            date: idea?.date,
            dateString: global.getDateString(new Date(idea?.date), false,false),
            notification: idea?.notification && (idea?.user.id === global.user.id) ? idea?.notification : false
        })
    });
    return newData;
}

const IdeaItem = ({ item, index, setItem, statuses, categories = [],
                      selectType = () => false, selectCategory = () => false,
                      includedTypes = [], types = [], includedCategory = [],
                      showContent = true, showCommentsCount = true, showLikes = true }) => {

    const [idea, setIdea] = useState(item);
    const [date, setDate] = useState("");
    const [visible, setVisible] = useState(false);
    const [editable, setEditable] = useState(false);

    useLayoutEffect(() => {
        let newIdea = {...item};
        setDate(global.getDateString(new Date(item?.date), false,false));
        newIdea.comments.map(comment => {
            comment.dateString = global.getDateString(new Date(comment?.date))
        })
    }, []);

    useEffect(() => {
        if(editable){
            console.log("idea changed")
            setItem(idea, index)
        } else {
            setEditable(true)
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
                    });
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
                    });
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
        newIdea.showComments = !newIdea.showComments;
        if(idea?.notification && idea?.user.id === global.user.id){
            axios.post(ApiRoutes.API_CHECK_ALL_COMMENTS, { idea_id: idea.idea_id })
                .then(response => {
                    global.handleResponse(response,
                        function () {
                            newIdea.notification = false
                            setIdea(newIdea)
                            console.log("все комменты чекнулись:", newIdea)
                        },
                    )
                })
        } else {
            setIdea(newIdea)
        }
    };

    const changeStatus = (idea_id, id, name) => {
        axios.post(ApiRoutes.API_SET_STATUS, {idea_id: idea_id, status_id: id})
            .then(response => {
                global.handleResponse(response,
                    function () {
                        global.openNotification("Успешно", "Статус идеи изменен", "success")
                        let newIdea = {...idea};
                        newIdea.status = id;
                        if (name.data === "declined" || name.data === "completed") {
                            newIdea.allowComments = false;
                        } else {
                            newIdea.allowComments = true;
                        }
                        setIdea(newIdea)
                    },
                    function () {
                        global.openNotification("Ошибка", response.data?.message, "error")
                    },
                )
            })
    };

    const changeCategory = (categoryId) => {
        axios.post(ApiRoutes.API_SET_CATEGORY, {idea_id: idea.idea_id, category_id: categoryId})
            .then(response => {
                global.handleResponse(response,
                    function () {
                        let data = {...idea};
                        data.categoryId = categoryId;
                        data.category = categories.filter(item => item.id === categoryId)[0].name;
                        setIdea(data)
                        global.openNotification("Успешно", "Категория идеи успешно изменена", "success")
                    },
                    function () {
                        global.openNotification("Ошибка", response.data?.message, "error")
                    },
                )
            })
    };

    const changeType = (typeId) => {
        axios.post(ApiRoutes.API_SET_TYPE, {idea_id: idea.idea_id, type_id: typeId})
            .then(response => {
                global.handleResponse(response,
                    function () {
                        let data = {...idea};
                        data.typeId = typeId;
                        data.type = types.filter(item => item.id === typeId)[0].name;
                        setIdea(data);
                        global.openNotification("Успешно", "Тип идеи успешно изменён", "success")
                    },
                    function () {
                        global.openNotification("Ошибка", response.data?.message, "error")
                    },
                )
            })
    };

    const onDeleteComment = (id, official) => {
        axios.post(ApiRoutes.API_DELETE_COMMENT, {comment_id: id}).then(response => {
            if (response.data.state === "success") {
                if (official){
                    let newIdea = {...idea};
                    delete newIdea.officialComment;
                    newIdea.comments = newIdea.comments.filter(item => item.id !== id);
                    setIdea(newIdea);
                } else {
                    let dataType = {...idea};
                    dataType.comments = dataType.comments.filter(item => item.id !== id);
                    console.log(dataType, id)
                    setIdea(dataType);
                }
                global.openNotification("Успешно", "Комментарий удален", "success")
            } else {
                global.openNotification("Ошибка", "Комментарий не удален", "error")
            }
        })
    };

    return (
        <>
            <div className={"f-cards"} key={index} id={index}>
                <div className={"f-text-tags-wrap"}>
                    {
                        categories.length !== 0 && global.layout === "admin" ?
                            <Popover
                                content={
                                    <Segmented
                                        value={idea?.categoryId}
                                        onChange={(value) => changeCategory(value)}
                                        options={categories.map((item) => {
                                            return {label: item.name, value: item.id}
                                        })} />
                                }>
                                <div className={"f-cards-hashtag " + (selectType() && "f-cards-hashtag-hover")}
                                     style={{
                                         backgroundColor: !includedCategory.includes(idea?.categoryId) ? '#FFFFFF48' : '#FFFFFF',
                                         color: '#1D1D1F'
                                     }}
                                     onClick={() => {
                                         selectCategory(idea.categoryId)
                                     }}>{idea?.category}
                                </div>
                            </Popover> :
                            <div className={"f-cards-hashtag " + (selectType() && "f-cards-hashtag-hover")}
                                 style={{
                                     backgroundColor: !includedCategory.includes(idea?.categoryId) ? '#FFFFFF48' : '#FFFFFF',
                                     color: '#1D1D1F'
                                 }}
                                 onClick={() => {
                                     selectCategory(idea.categoryId)
                                 }}>{idea?.category}
                            </div>
                    }
                    {
                        types.length !== 0 && global.layout === "admin" ?
                            <Popover
                                content={
                                    <Segmented
                                        value={idea?.typeId}
                                        onChange={(value) => changeType(value)}
                                        options={types.map((item) => {
                                            return {label: item.name, value: item.id}
                                        })}/>}
                            >
                                <p style={{
                                    marginLeft: 0,
                                    color: (includedTypes.includes(idea.typeId) && types[idea.typeId - 1]?.color) && types[idea.typeId - 1]?.color,
                                }} className={"f-cards-hashtag " + (selectType() && "f-cards-hashtag-hover")}
                                   onClick={() => {
                                       selectType(idea.typeId)
                                   }}>#{idea?.type}
                                </p>
                            </Popover> :
                            <p style={{
                                marginLeft: 0,
                                color: (includedTypes.includes(idea.typeId) && types[idea.typeId - 1]?.color) && types[idea.typeId - 1]?.color,
                            }} className={"f-cards-hashtag " + (selectType() && "f-cards-hashtag-hover")}
                               onClick={() => {
                                   selectType(idea.typeId)
                               }}>#{idea?.type}
                            </p>
                    }
                </div>
                <div className={"f-cards-card-wrap"} key={index}>
                    {
                        idea?.photo !== null &&
                        <div className={"f-cards-image-type"}
                             onClick={() => setVisible(true)}
                             style={{backgroundImage: 'url("' + idea?.photo.split(";")[0] + '")', cursor: 'pointer'}}>
                            { idea?.photo.split(";").length > 1 &&
                                <div className={"f-image-count"}>
                                    <span style={{fontSize: 18}}>1/{idea?.photo.split(";").length}</span>
                                </div>
                            }
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
                                        idea?.photo.split(";").map((item, index) => (
                                            <Image key={index} src={item} />
                                        ))
                                    }
                                </Image.PreviewGroup>
                            </div>
                        </div>
                    }
                    <div className={"f-cards-inner"} style={{ padding:"35px 0 10px 0  " , marginTop: idea?.photo !== null ? -40 : 0, paddingBottom: (idea.officialComment && !idea.showComments) && 60 }}>
                        <div style={{ paddingLeft: 40, paddingRight: 50 }}>
                            <div className={"f-cards-avatar"}>
                                <Link to={global.lang + `/profile/${idea.user.id}`}>
                                    <div className={"f-cards-row-wrap"}>
                                        <Avatar size={48} style={{backgroundColor: '#AAB2BD'}}
                                                src={idea.userImage
                                                    ? <img src={idea.userImage}/>
                                                    : <UserOutlined/>
                                                }/>
                                        <div className={"f-cards-wrap-text-style"}>
                                            <div>
                                            <span className={"f-cards-text"}>{idea.username}
                                                {
                                                    ["ROLE_ADMIN", "ROLE_DEVELOPER"].some(el => idea?.roles.includes(el)) &&
                                                    <img style={{marginBottom: 3, marginLeft: 5}}
                                                         src={"/i/official.svg"} width={15}
                                                         height={15}/>
                                                }
                                            </span>
                                            </div>
                                            <span className={"f-cards-text-bottom"}>{idea.role}
                                                <span> · </span>
                                                {date}
                                        </span>
                                        </div>
                                    </div>
                                </Link>
                                {
                                    global.layout === "admin" ?
                                        <Select
                                            size={'large'}
                                            onSelect={(id, data) => {
                                                changeStatus(idea.idea_id, id, data)
                                            }}
                                            style={{height: '100%'}}
                                            defaultValue={idea.status.id}
                                        >
                                            {
                                                statuses.map(status => (
                                                    <Option data={status.name}
                                                            value={status.id}>{status.translate}</Option>
                                                ))
                                            }
                                        </Select> :
                                        <div>
                                            <p className={"f-cards-type-viewed"} style={{
                                                // marginTop: "1em",
                                                color: idea.status?.color ? idea.status?.color : "#000000",
                                                backgroundColor: idea.status?.color ? idea.status?.color + "30" : "#AAB2BD",
                                            }}
                                            >{idea.status.translate}</p>
                                        </div>
                                }
                            </div>
                            <div className={"f-cards-div-wrap-text"} style={{marginBottom: showContent ? 20 : 0}}>
                                <Link to={global.lang + "/idea/" + idea.idea_id + "/"}>
                                <span className={"f-cards-content-text"}>
                                    {idea.title}
                                </span>
                                </Link>
                            </div>
                            {showContent &&
                            <div className={"f-cards-div-wrap-text"}>
                                <span className={"f-cards-content-description"}>
                                    <Linkify>
                                    {
                                        idea.text.split(" ").length <= 40 ?
                                            <span>{idea.text}</span> :
                                            idea.text.split(" ").length > 40 && !idea.showFullText ?
                                                <span>{idea.text.split(" ").filter((idea, index) => index < 40).join(" ")}... <a
                                                    onClick={() => showText(idea.showFullText)}>Еще</a>
                                                </span> :
                                                <span>{idea.text} <a style={{zIndex: 3}}
                                                                     onClick={() => showText(idea.showFullText)}>Скрыть</a></span>
                                    }
                                    </Linkify>
                                </span>
                            </div>
                            }
                            <div className={"f-cards-under-block"}>
                                {(idea.notification === true) &&
                                <div style={{
                                    width: 6,
                                    height: 6,
                                    marginRight: 5,
                                    borderRadius: 100,
                                    backgroundColor: '#3D72ED'
                                }}/>
                                }
                                {showCommentsCount &&
                                <div>
                                    <a onClick={() => {
                                        showComments()
                                    }} className={"f-cards-under-block-comment"}>
                                        {global.numWord(idea.comments.length, ["комментарий", "комментария", "комментариев"])}
                                    </a>
                                </div>
                                }
                                <div>
                                    {showLikes ?
                                        global.layout === 'guest' ?
                                            <Tooltip color={"black"} title="Авторизуйтесь, чтобы оценить">
                                                <button className={"f-cards-under-block-like"}
                                                        disabled={true}
                                                        type={"button"}
                                                        style={{
                                                            backgroundColor: 'white',
                                                            cursor: 'not-allowed',
                                                            border: 'none',
                                                        }}
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Icon component={Like} style={{fontSize: 23}}/>
                                                        <span
                                                            style={{color: idea.currentUserIsVote === true ? "#FFF" : ""}}
                                                            className={"f-cards-under-block-like-text"}>{idea.like}</span>
                                                    </div>
                                                </button>
                                            </Tooltip> : idea.allowComments === false ?
                                            <Tooltip color={"black"} title="Голосование за эту идею закрыто">
                                                <div className={"f-cards-under-block-like"} style={{
                                                    backgroundColor: idea.currentUserIsVote === true ? "#3D72ED" : "",
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    cursor: 'not-allowed',
                                                }}>
                                                    <Icon component={Like} style={{fontSize: 23}}/>
                                                    <span
                                                        style={{color: idea.currentUserIsVote === true ? "#FFF" : ""}}
                                                        className={"f-cards-under-block-like-text"}>{idea.like}</span>
                                                </div>
                                            </Tooltip> :
                                            <button type={"button"} style={{
                                                backgroundColor: idea.currentUserIsVote === true ? "#3D72ED" : "",
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                                    className={"f-cards-under-block-like"}
                                                    onClick={() => newVote(idea.idea_id, idea.currentUserIsVote)}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Icon component={Like} style={{fontSize: 23}}/>
                                                    <span style={{color: idea.currentUserIsVote === true ? "#FFF" : ""}}
                                                          className={"f-cards-under-block-like-text"}>{idea.like}</span>
                                                </div>
                                            </button>
                                        : <></>
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
                        </div>
                        {
                            idea.showComments &&
                            <Comments onDeleteComment={onDeleteComment} allowComments={idea.allowComments} idea={idea} index={index}
                                      comments={idea.comments} setIdea={setIdea} setComments={setIdeaComments}/>

                        }
                    </div>
                    {
                        (idea.officialComment && !idea.showComments) &&
                        <OfficialComment onDeleteComment={onDeleteComment} commentData={idea.officialComment}/>
                    }
                </div>
            </div>
        </>
    )
}

export default IdeaItem;