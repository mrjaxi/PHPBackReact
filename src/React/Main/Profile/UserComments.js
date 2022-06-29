import React, {useEffect, useLayoutEffect, useState} from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import FlatList from "flatlist-react";
import {NavLink} from "react-router-dom";
import {Avatar} from "antd";
import {UserOutlined} from "@ant-design/icons";
import Linkify from "react-linkify";
import IdeaItem from "../Components/Idea/IdeaItem";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const UserComments = ({ user, user_id, setCount }) => {

    const [statuses, setStatuses] = useState([]);
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(false);

    let ideasData = [];

    useLayoutEffect(() => {
        updateStatuses();
        getUserComments()
    }, []);

    useEffect(() => {
        if(ideas.length >= 0){
            let commentsCount = 0;
            ideas.map(idea => {
                commentsCount += idea?.comments.length
            })
            setCount(commentsCount)
        }
    }, [ideas])

    useEffect(() => {
        if(user) {
            let prevIdeas = [...ideas]
            prevIdeas?.map(idea => {
                idea?.comments?.map(comment => {
                    comment.user.roles = user?.roles;
                    comment.user.role_name = user?.role_name;
                })
            })
            setIdeas(prevIdeas)
        }
    }, [user])

    const getUserComments = () => {
        setLoading(true)
        axios.get(ApiRoutes.API_GET_USER_DATA.format(user_id) + "?" + global.serialize({page: "2"})).then(response => {
            if (response.data.state === "success" && response.data?.ideas) {
                response.data.ideas.map(idea => {
                    let newIdea = {
                        idea_id: idea.id,
                        title: idea.title,
                        text: idea.content,
                        showComments: true,//idea.comments.length > 0,
                        showFullText: false,
                        roles: idea?.user.roles,
                        role: idea?.user.role_name,
                        status: idea.status,
                        photo: idea.photo,
                        comments: idea.comments,
                        like: Number(idea.likes),
                        dislike: 2,
                        categoryId: idea.category.id,
                        category: idea.category.name,
                        user: idea.user,
                        username: idea.user?.first_name,
                        userImage: idea.user.image,
                        type: idea.type.name,
                        currentUserIsVote: idea.currentUserIsVote,
                        allowComments: false,
                        date: idea?.date
                    }
                    ideasData.push(newIdea)
                })
            }
            setIdeas(ideasData);
            setLoading(false)
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas]
        newIdeas[index] = idea
        setIdeas(newIdeas)
    }

    const updateStatuses = () => {
        axios.get(ApiRoutes.API_GET_CATEGORIES).then(response => {
            setStatuses(response.data?.statuses);
        })
    };

    return (
        <>
            {loading ? <LoadingIdeas type={true}/> :
                <FlatList
                    list={ideas}
                    renderItem={(idea, index) => {
                        return (
                            <IdeaItem item={idea} index={index} setItem={setIdea} statuses={statuses}
                                      showContent={false} showCommentsCount={false} showLikes={false}/>
                        )
                    }}
                    renderWhenEmpty={() =>
                        <EmptyIdeas text={user.id === global.user.id ? "Вы еще не прокомментировали ни одну запись" : "Пользователь еще не прокомментировал ни одной записи"}/>
                    }
                />
            }
        </>
    )
};
export default UserComments;