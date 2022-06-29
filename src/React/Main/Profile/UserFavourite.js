import React, {useEffect, useLayoutEffect, useState} from "react";
import {Col, Select} from "antd";
import Comments from "../Components/Comments";
const { Option } = Select
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import FlatList from "flatlist-react";
import IdeaItem from "../Components/Idea/IdeaItem";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";
import UserIdeas from "./UserIdeas";

const UserFavourite = ({ user, user_id, setCount }) => {

    let data = [];

    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ideas, setIdeas] = useState([]);

    useLayoutEffect(() => {
        updateStatuses();
        getUserFavourites()
    }, []);

    useEffect(() => {
        if(ideas.length >= 0)
            setCount(ideas.length)
    }, [ideas])

    useEffect(() => {
        if(user){
            let prevIdeas = [...ideas]
            prevIdeas.map(idea => {
                if(idea?.user.id === global.user.id){
                    idea.roles = user?.roles
                    idea.role = user?.role_name
                }
            })
            setIdeas(prevIdeas)
        }
    }, [user])

    const getUserFavourites = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(user_id) + "?" + global.serialize({page: "3"})).then(response => {
            if (response.data.state === "success" && response.data?.likes){
                response.data.likes.map(item => {
                    let idea = item.idea
                    data.push({
                        idea_id: idea.id,
                        title: idea.title,
                        text: idea.content,
                        showComments: false,//item.comments.length > 0,
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
                        allowComments: idea.allowComments,
                        date: idea?.date
                    })
                })
            }
            setIdeas(data);
            setLoading(false)
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas];
        newIdeas[index] = idea;
        setIdeas(newIdeas)
    };

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
                            <IdeaItem item={idea} index={index} setItem={setIdea}
                                      statuses={statuses}/>
                        )
                    }}
                    renderWhenEmpty={() =>
                        <EmptyIdeas text={user.id === global.user.id ? "Вы еще не оценили ни одну запись" : "Пользователь еще не оценил ни одной записи"}/>
                    }
                />
            }
        </>
    )
};

export default UserFavourite;