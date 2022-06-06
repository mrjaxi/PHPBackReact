import React, {useEffect, useState} from "react";
import {Col, Select} from "antd";
import Comments from "../Comments";
const { Option } = Select
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";

const UserFavourite = () => {

    let data = [];

    const [statuses, setStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);


    const getUserFavourites = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(global.user.id) + "?" + global.serialize({page: "3"})).then(response => {
            if (response.data.state === "success" && response.data?.likes){
                response.data.likes.map(item => {
                    data.push({
                        id: item.idea.id,
                        title: item.idea.title,
                        text: item.idea.content,
                        showComments: item.idea.comments.length > 0,
                        showFullText: false,
                        roles: item.idea.user.roles,
                        role: item.idea.user.role_name,
                        status: item.idea.status,
                        photo: item.idea.photo,
                        comments: item.idea.comments,
                        like: Number(item.idea.likes),
                        dislike: 2,
                        username: item.idea.user?.first_name,
                        type: item.idea.type.name,
                        currentUserIsVote: true,
                        allowComments: item.idea.allowComments
                    })
                })

                setItems(data);
                setLoading(false)
            } else {
                setItems([])
                setLoading(false)
            }
        })
    };

    const getCategory = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatus(response.data.statuses);
        });
        setLoading(false);
    };

    const newVote = (id, index, currentUserIsVote) => {
        currentUserIsVote ?
            axios.post(ApiRoutes.API_DELETE_VOTE, {idea_id: id}).then(response => {
                if (response.data.state === "success"){
                    let data = [...items];
                    data[index].like -= 1;
                    data[index].currentUserIsVote = !currentUserIsVote;

                    setItems(data)
                } else {
                    global.openNotification("Ошибка", response.data.message, "error")
                }
            }) :
            axios.post(ApiRoutes.API_NEW_VOTE, {idea_id: id, type: "like"}).then(response => {
                if (response.data.state === "success"){
                    let data = [...items];
                    data[index].like += 1;
                    data[index].currentUserIsVote = !currentUserIsVote;
                    setItems(data)
                } else {
                    global.openNotification("Ошибка", response.data.message, "error")
                }
            })
    };

    useEffect(() => {
        getCategory();
        getUserFavourites()
    }, []);

    const showText = (show, index) => {
        let data = [...items];
        data[index].showFullText = !show;

        setItems(data)
    };

    const showComments = (index) => {
        let data = [...items];

        const flag = data[index].showComments;
        data[index].showComments = !flag;
        setItems(data)
    };

    const addCommentToIdea = (index, comment) => {
        let data = [...items];
        data[index].comments.push(comment);
        setItems(data)
    };

    const changeStatus = (idea_id, id, name, index) => {
        axios.post(ApiRoutes.API_SET_STATUS, {idea_id: idea_id, status_id: id}).then(response => {
            if (response.data.state === "success"){
                let data = [...items];
                data[index].status = id;

                if (name.data === "declined" || name.data === "completed"){
                    data[index].allowComments = false;
                } else {
                    data[index].allowComments = true;
                }
                setItems(data)
            } else {
                global.openNotification("Ошибка", response.data.message, "error")
            }
        })
    };

    return (
        <>
            {
                loading ? <></> :
                    <>
                        <div className={"f-row-type max_width"} style={{ marginTop: 100 }}>
                            <div style={{
                                width: '100%',
                                display: "flex",
                                justifyContent: 'center',
                                flexDirection: "column",
                                alignItems: "center",
                                paddingLeft: 200,
                                paddingRight: 200,
                            }}>
                                <div className={"f-row-type max_width"}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: 'center',
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: '60vw'
                                    }}>
                                        {
                                            items.length === 0 ?
                                                <div className={"f-cards"}>
                                                    <div>
                                                        <div className={"f-cards-card-wrap"}>
                                                            <div className={"f-cards-inner"}>
                                                                <div className={"f-cards-div-wrap-text"}>
                                                    <span className={"f-cards-content-text"}>
                                                        <div>Вы пока не лайкнули ни одной идеи...</div>
                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                items.map((item, index) => (
                                                    <div className={"f-cards"}>
                                                        <div>
                                                            <p style={{ marginLeft: 10 }} className={"f-cards-hashtag"}>#{item.type}</p>
                                                            <div className={"f-cards-card-wrap"}>
                                                                {
                                                                    item.photo !== null &&
                                                                    <div className={"f-cards-image-type"} style={{ backgroundImage: 'url("' + item.photo.split(";")[0] + '")' }} />
                                                                }
                                                                <div className={"f-cards-inner"}>
                                                                    <div className={"f-cards-avatar"}>
                                                                        <div className={"f-cards-row-wrap"}>
                                                                            <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                                            <div className={"f-cards-wrap-text"}>
                                                                                <span className={"f-cards-text"}>{ item.username }
                                                                                    {
                                                                                        item.roles.includes("ROLE_ADMIN") &&
                                                                                        <img style={{ marginBottom: 3, marginLeft: 5 }} src={"/i/official.svg"} width={15} height={15}/>
                                                                                    }
                                                                                </span>
                                                                                <span className={"f-cards-text-bottom"}>{ item.role }</span>
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            global.layout === "admin" ?
                                                                                <Select onSelect={(id, data) => changeStatus(item.id, id, data, index)} defaultValue={ item.status.id } style={{ width: 130 }}>
                                                                                    {
                                                                                        statuses.map(status => (
                                                                                            <Option data={status.name} value={status.id}>{status.translate}</Option>
                                                                                        ))
                                                                                    }
                                                                                </Select> :
                                                                                <p className={"f-cards-type f-type-viewed"}>{ item.status.translate }</p>
                                                                        }
                                                                    </div>
                                                                    <div className={"f-cards-div-wrap-text"}>
                                                                        <span className={"f-cards-content-text"}>
                                                                            { item.title }
                                                                        </span>
                                                                    </div>
                                                                    <div className={"f-cards-div-wrap-text"}>
                                                                        <span className={"f-cards-content-description"}>
                                                                            {
                                                                                item.text.split(" ").length < 25 ? <span>{item.text}</span> :
                                                                                    item.text.split(" ").length > 25 && !item.showFullText ?
                                                                                        <span>{item.text.split(" ").filter((item, index) => index < 25).join(" ")}... <a onClick={() => showText(item.showFullText, index)}>Еще</a></span> :
                                                                                        <span>{item.text} <a style={{ zIndex: 3  }} onClick={() => showText(item.showFullText, index)}>Скрыть</a></span>
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className={"f-cards-under-block"}>
                                                                        <div>
                                                                            <a onClick={() => { showComments(index) }} className={"f-cards-under-block-comment"}>{ item.comments.length } комментариев</a>
                                                                        </div>
                                                                        <div>
                                                                            <a style={{ backgroundColor: item.currentUserIsVote === true ? "#90EE90" : "" }} className={"f-cards-under-block-like"} onClick={() => newVote(item.id, index, item.currentUserIsVote)}>
                                                                                <i className="em em---1"
                                                                                   aria-label="THUMBS UP SIGN"></i>
                                                                                <span className={"f-cards-under-block-like-text"}>{ item.like }</span>
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
                                                                        item.showComments &&
                                                                        <Comments allowComments={item.allowComments} item={item} index={index} addCommentToIdea={addCommentToIdea} comments={item.comments} />
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
            }
        </>
    )
};

export default UserFavourite;