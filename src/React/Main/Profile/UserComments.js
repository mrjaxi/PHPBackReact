import React, {useEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import FlatList from "flatlist-react";
import {NavLink} from "react-router-dom";

const UserComments = () => {

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    let commentsData = [];
    let months = ["января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"];

    useEffect(() => {
        getUserComments()
    }, []);

    const getUserComments = () => {
        setLoading(true)
        axios.get(ApiRoutes.API_GET_USER_DATA.format(global.user.id) + "?" + global.serialize({page: "2"})).then(response => {
            if (response.data.state === "success" && response.data?.comments) {
                response.data.comments.map(item => {
                    let date = new Date(item?.date)
                    let timeArr = item?.date.split(" ")[1].split(":")
                    // ${Number(dateArr[0])} ${months[dateStart.getMonth()]} ${dateArr[2]}
                    let dateString = `${Number(date.getUTCDate())} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}` +
                        ` в ${timeArr[0]}:${timeArr[1]}`
                    console.log("DATE:",dateString)
                    let comment = {
                        id: item.id,
                        date: dateString,
                        photo: item.user.image,
                        content: item.content,
                        roles: item.user.roles,
                        role: item.user.role_name,
                        username: item.user?.first_name,
                        ideaId: item?.idea_id,
                    }
                    commentsData.push(comment)
                })
            }
            setComments(commentsData);
            setLoading(false)
        })
    };

    return (
        <>
            <div className={"max_width"} style={{paddingTop: "10vh"}}>
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
                                                                <img className={"f-cards-image"} src={"/i/avatar.png"}/>
                                                                <div className={"f-cards-wrap-text"}>
                                                                <span className={"f-cards-text"}>{ comment?.username }
                                                                    {
                                                                        comment?.roles.includes("ROLE_ADMIN") &&
                                                                        <img style={{ marginBottom: 3, marginLeft: 5 }} src={"/i/official.svg"} width={15} height={15}/>
                                                                    }
                                                                </span>
                                                                    <span className={"f-cards-text-bottom"}>{ comment?.role }</span>
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
                                                            { comment?.content }
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