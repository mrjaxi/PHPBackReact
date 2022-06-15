import React, {useEffect, useState} from "react";
import {Col, Select} from "antd";
import Comments from "../Comments";
const { Option } = Select
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import FlatList from "flatlist-react";
import IdeaItem from "../Components/Idea/IdeaItem";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const UserFavourite = () => {

    let data = [];

    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ideas, setIdeas] = useState([]);

    useEffect(() => {
        updateStatuses();
        getUserFavourites()
    }, []);

    const getUserFavourites = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(global.user.id) + "?" + global.serialize({page: "3"})).then(response => {
            if (response.data.state === "success" && response.data?.likes){
                response.data.likes.map(item => {
                    let idea = item.idea
                    data.push({
                        idea_id: idea.id,
                        title: idea.title,
                        text: idea.content,
                        showComments: false,//item.comments.length > 0,
                        showFullText: false,
                        roles: idea.user.roles,
                        role: idea.user.role_name,
                        status: idea.status,
                        photo: idea.photo,
                        comments: idea.comments,
                        like: Number(idea.likes),
                        dislike: 2,
                        username: idea.user?.first_name,
                        userImage: idea.user.image,
                        type: idea.type.name,
                        currentUserIsVote: idea.currentUserIsVote,
                        allowComments: idea.allowComments,
                        date: idea?.date
                    })
                })
            }
            setIdeas(data)
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
                                <EmptyIdeas text={"Вы еще оценили ни одной записи"}/>
                            }
                        />
                    }
                </div>
            </div>
        </>
    )
};

export default UserFavourite;