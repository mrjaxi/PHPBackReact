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

const UserComments = ({ user, setCount, updateCounts }) => {

    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        getUserComments()
    }, []);

    useEffect(() => {
        if(user) {
            let prevIdeas = [...ideas]
            prevIdeas?.map(idea => {
                if(idea?.user.id === user.id) {
                    idea.roles = user?.roles
                    idea.role = user?.role_name
                    idea.user.roles = user?.roles
                    idea.user.role_name = user?.role_name
                }
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
        axios.get(ApiRoutes.API_GET_USER_DATA.format(user.id) + "?" + global.serialize({page: "2"})).then(response => {
            let ideasData = [];
            global.handleResponse(response,
                function () {
                    ideasData = global.parseToIdeaItems(response.data?.ideas, ideasData, true, false)
                    setCount(response.data?.count)
                },
            )
            setIdeas(ideasData);
            setLoading(false)
        })
    };

    const setIdea = (idea, index) => {
        let newIdeas = [...ideas]
        newIdeas[index] = idea
        setIdeas(newIdeas)
        updateCounts()
    }

    return (
        <>
            {loading ? <LoadingIdeas type={true}/> :
                <FlatList
                    list={ideas}
                    renderItem={(idea, index) => {
                        return (
                            <IdeaItem item={idea} index={index} setItem={setIdea}
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