import React, { useLayoutEffect, useState } from "react";
import axios from "axios";
import ApiRoutes from "../../Routes/ApiRoutes";
import FlatList from "flatlist-react";
import IdeaItem from "../Components/Idea/IdeaItem";
import LoadingIdeas from "../Components/Idea/LoadingIdeas";
import EmptyIdeas from "../Components/Idea/EmptyIdeas";

const UserIdeas = () => {

    let data = [];

    const [statuses, setStatuses] = useState([]);
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        updateStatuses();
        getUserIdeas()
    }, []);

    const getUserIdeas = () => {
        setLoading(true);
        axios.get(ApiRoutes.API_GET_USER_DATA.format(global.user.id) + "?" + global.serialize({page: "1"})).then(response => {
            switch (response.data?.state) {
                case "success":
                    if (response.data?.ideas) {
                        response.data.ideas.map(idea => {
                            data.push({
                                idea_id: idea.id,
                                title: idea.title,
                                text: idea.content,
                                showComments: false,//idea.comments.length > 0,
                                showFullText: false,
                                roles: idea.user.roles,
                                role: idea.user.role_name,
                                status: idea.status,
                                photo: idea.photo,
                                comments: idea.comments,
                                like: Number(idea.likes),
                                dislike: 2,
                                categoryId: idea.category.id,
                                category: idea.category.name,
                                username: idea.user?.first_name,
                                userImage: idea.user.image,
                                type: idea.type.name,
                                currentUserIsVote: idea.currentUserIsVote,
                                allowComments: idea.allowComments,
                                date: idea?.date
                            })
                        });
                    }
                    break;
                case "error":
                    global.openNotification("Ошибка", response.data?.message, "error")
                    break;
                default:
                    global.openNotification("Ошибка", "Непредвиденная ошибка", "error")
                    break;
            }
            setIdeas(data);
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
                                <EmptyIdeas text={"Вы еще не добавили ни одной записи"}/>
                            }
                        />
                    }
                </div>
            </div>
        </>
    )
};

export default UserIdeas;